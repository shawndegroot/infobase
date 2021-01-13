import { SelectAllControl } from "../charts/legends/index.js";

import {
  create_text_maker_component,
  Details,
  LabeledBox,
  TagCloud,
} from "../components/index.js";
import { Table } from "../core/TableClass.js";
import { PanelRegistry } from "../panels/PanelRegistry.js";

import text from "./PanelFilterControl.yaml";

const { text_maker, TM } = create_text_maker_component(text);

export default class PanelFilterControl extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      table_tags: this.get_default_table_tag_state(),
    };
  }
  shouldComponentUpdate(nextProps, nextState) {
    return this.state.table_tags !== nextState.table_tags;
  }
  componentDidUpdate() {
    this.props.set_panel_filter(this.panel_filter_factory());
  }
  render() {
    const { panel_keys } = this.props;
    const { table_tags } = this.state;

    const panel_filter = this.panel_filter_factory();

    const tags = _.chain(table_tags)
      .map((active, table_id) => ({
        id: table_id,
        label: Table.lookup(table_id).name,
        active,
      }))
      .sortBy("label")
      .value();

    return (
      <Details
        summary_content={
          <div>
            <TM style={{ fontSize: 16 }} k="filter_panels" />
            <TM
              className="panel-status-text"
              k="panels_status"
              args={{
                total_number_of_panels: panel_keys.length,
                number_of_active_panels: panel_filter(panel_keys).length,
              }}
            />
          </div>
        }
        persist_content={true}
        content={
          <LabeledBox
            label={text_maker("filter_panels_description")}
            children={
              <div>
                <TagCloud tags={tags} onSelectTag={this.onSelect} />
                <div
                  style={{
                    borderTop: `1px dashed ${window.infobase_color_constants.tertiaryColor}`,
                    padding: "10px 0px 10px 5px",
                  }}
                >
                  <SelectAllControl
                    SelectAllOnClick={this.onSelectAll}
                    SelectNoneOnClick={this.onSelectNone}
                  />
                </div>
              </div>
            }
          />
        }
      />
    );
  }
  get_default_table_tag_state = () =>
    _.chain(this.props.panel_keys)
      .flatMap(
        (panel_key) =>
          PanelRegistry.lookup(panel_key, this.props.subject.level)?.depends_on
      )
      .uniq()
      .map((table_id) => [table_id, true])
      .fromPairs()
      .value();
  onSelect = (table_id) => {
    const { table_tags } = this.state;

    this.setState({
      table_tags: { ...table_tags, [table_id]: !table_tags[table_id] },
    });
  };
  onSelectAll = () => {
    const { table_tags } = this.state;

    this.setState({
      table_tags: _.mapValues(table_tags, _.constant(true)),
    });
  };
  onSelectNone = () => {
    const { table_tags } = this.state;

    this.setState({
      table_tags: _.mapValues(table_tags, _.constant(false)),
    });
  };
  panel_filter_factory = () => _.identity; //todo
}
