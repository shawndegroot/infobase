import { text_maker } from "./rpb_text_provider.js";
import { createSelector } from "reselect";

//data
import { Subject } from "../models/subject.js";
import { Table } from "../core/TableClass.js";
import Footnote from "../models/footnotes/footnotes.js";

const initial_state = {
  table_picking: true,
  subject: "gov_gov",
};

console.log("new redux");

function get_all_data_columns_for_table(table) {
  return _.chain(table.unique_headers)
    .map((nick) => table.col_from_nick(nick))
    .filter((col) => !col.hidden && !col.key && col.not_for_display !== true)
    .value();
}

function get_default_dimension_for_table(table) {
  return table.dimensions[0].title_key;
}

//returns a the proposed new slice of state that will change when a new table is selected
function get_default_state_for_new_table(table_id) {
  const table = Table.lookup(table_id);
  const columns = _.map(get_all_data_columns_for_table(table), "nick");
  return {
    table: table_id,
    columns,
    dimension: get_default_dimension_for_table(table),
    filter: text_maker("all"),
    broken_url: false,
  };
}

function naive_to_real_state(naive_state) {
  const { table } = naive_state;

  return {
    //default state
    subject: "gov_gov",
    ...//tables imply their own default state
    (table ? get_default_state_for_new_table(naive_state.table) : {}),
    ...naive_state, //whatever state is already defined takes precedence.
  };
}

function get_key_columns_for_table(table) {
  return _.chain(table.unique_headers)
    .map((nick) => table.col_from_nick(nick))
    .filter((col) => (col.key && !col.hidden) || col.nick === "dept")
    .value();
}

//Note that this will cause a memory leak as this closure will never get GC'd
const get_filters_for_dim = _.memoize(
  (table, dim_key) =>
    _.uniq([text_maker("all"), ..._.keys(table[dim_key]("*", true))]),
  (table, dim_key) => `${table.id}-${dim_key}`
);

const reducer = (state = initial_state, action) => {
  const { type, payload } = action;
  console.log(state);

  switch (type) {
    case "navigate_to_new_state": {
      const new_state = payload;
      return new_state;
    }

    case "switch_table": {
      const table_id = payload;
      return { ...state, ...get_default_state_for_new_table(table_id) };
    }

    case "set_filter": {
      const { dimension, filter } = payload;
      return {
        ...state,
        dimension,
        filter,
      };
    }

    case "set_dimension": {
      return {
        ...state,
        dimension: payload,
        filter: text_maker("all"),
      };
    }

    default:
      return state;
  }
};

function create_mapStateToProps() {
  const get_table = createSelector(_.property("table"), (table) =>
    Table.lookup(table)
  );

  const get_subject = createSelector(_.property("subject"), (guid) =>
    Subject.get_by_guid(guid)
  );

  const get_all_data_columns = createSelector(
    get_table,
    get_all_data_columns_for_table
  );

  const get_sorted_columns = createSelector(
    [get_table, _.property("columns")],
    (table, col_nicks) =>
      _.filter(get_all_data_columns_for_table(table), ({ nick }) =>
        _.includes(col_nicks, nick)
      )
  );

  const get_sorted_key_columns = createSelector(
    get_table,
    get_key_columns_for_table
  );

  const get_def_ready_cols = createSelector(
    get_table,
    get_sorted_columns,
    (table, sorted_data_columns) =>
      _.chain(sorted_data_columns)
        .map((col) => ({
          name: col.fully_qualified_name,
          def: table.column_description(col.nick),
        }))
        .value()
  );

  //array of html footnotes
  const get_footnotes = createSelector(
    [get_table, get_subject],
    (table, subject) => {
      const topics = table.tags.concat(["MACHINERY"]);
      const subject_footnotes = Footnote.get_for_subject(subject, topics);
      return subject_footnotes;
    }
  );

  const get_dimensions = createSelector(get_table, (table) =>
    _.chain(table.dimensions)
      .filter("include_in_report_builder")
      .map(({ title_key }) => ({
        id: title_key,
        display: text_maker(title_key),
      }))
      .value()
  );

  const get_all_filters = createSelector(
    [get_table, _.property("dimension")],
    (table, dim_key) => get_filters_for_dim(table, dim_key)
  );

  const get_filters_by_dimension = createSelector(
    [get_table, get_dimensions],
    (table, dimensions) =>
      _.map(dimensions, ({ id: dim_key, display }) => ({
        display,
        id: dim_key,
        children: _.map(get_filters_for_dim(table, dim_key), (filter) => ({
          filter: filter,
          dimension: dim_key,
          display: filter,
        })),
      }))
  );

  const get_table_data = createSelector(get_table, (table) => {
    table.fill_dimension_columns();
    return table.data;
  });

  const get_cat_filter_func = createSelector(
    [_.property("dimension"), _.property("filter")],
    (dim_key, filter_val) =>
      filter_val === text_maker("all")
        ? _.constant(true)
        : { [dim_key]: filter_val }
  );

  const get_zero_filter_func = createSelector(
    [_.property("columns")],
    (col_nicks) => (row) =>
      _.chain(col_nicks)
        .map((nick) => row[nick])
        .compact()
        .isEmpty()
        .value()
  );
  const get_flat_data = createSelector(
    [get_table_data, get_cat_filter_func, get_zero_filter_func],
    (table_data, cat_filter_func, zero_filter_func) =>
      _.chain(table_data)
        .filter(cat_filter_func)
        .reject(zero_filter_func)
        .value()
  );

  return (state) => {
    return {
      ...state,
      table: state.table && get_table(state),
      subject: state.subject && get_subject(state),
      columns: !_.isEmpty(state.columns) && get_sorted_columns(state),
      dimensions: state.table && get_dimensions(state),
      filters: state.table && get_all_filters(state),
      footnotes: state.table && get_footnotes(state),
      def_ready_columns: !_.isEmpty(state.columns) && get_def_ready_cols(state),
      all_data_columns:
        !_.isEmpty(state.columns) && get_all_data_columns(state),
      flat_data: state.table && get_flat_data(state),

      //granular props
      filters_by_dimension: state.table && get_filters_by_dimension(state),
      sorted_key_columns:
        !_.isEmpty(state.columns) && get_sorted_key_columns(state),
    };
  };
}

function mapDispatchToProps(dispatch) {
  return {
    on_set_dimension: (dim_key) =>
      dispatch({ type: "set_dimension", payload: dim_key }),
    on_set_filter: ({ dimension, filter }) =>
      dispatch({ type: "set_filter", payload: { dimension, filter } }),
    on_switch_table: (table_id) =>
      dispatch({ type: "switch_table", payload: table_id }),
  };
}

export {
  reducer,
  mapDispatchToProps,
  create_mapStateToProps,
  naive_to_real_state,
};
