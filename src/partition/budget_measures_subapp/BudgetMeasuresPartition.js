import './BudgetMeasuresPartition.ib.yaml';
import './BudgetMeasuresPartition.scss';




import { PartitionDiagram } from '../partition_diagram/PartitionDiagram.js';
import { formats } from '../../core/format.js';
import { text_maker } from "../../models/text";

import { budget_measures_hierarchy_factory } from './budget_measures_hierarchy_factory.js';

import * as Subject from '../../models/subject';
import * as businessConstants from '../../models/businessConstants.yaml';

const { budget_chapters } = businessConstants;
const { BudgetMeasure } = Subject;

const year = text_maker("budget_route_year");

const formatter = node => {
  const in_billions = node.__value__ >= Math.pow(10, 9);
  const format = in_billions ? formats.compact1 : formats.compact;
  return " (" + format(node.__value__) + ")";
}

const get_level_headers = (first_column) => {
  if (first_column === "dept"){
    return {
      "1": text_maker("org"),
      "2": text_maker("budget_measure"),
    };
  } else {
    return {
      "1": text_maker("budget_measure"),
      "2": text_maker("org"),
    };
  }
}

const root_text_func = (displayed_measure_count, root_value) => text_maker("budget_measures_partition_root", {root_value, displayed_measure_count});

const popup_template = node => {
  const dept_is_first_column = (node.depth === 1 && node.data.type === "dept") || (node.depth === 2 && node.parent.data.type === "dept");

  const is_dept = node.data.type === "dept";
  const has_infographic = is_dept && node.data.id !== 9999;

  const is_budget_measure = node.data.type === "budget_measure";

  const is_first_column = node.depth === 1;

  const dept_name = dept_is_first_column ? 
    is_first_column ? node.data.name : node.parent.data.name :
    !is_first_column ? node.data.name : node.parent.data.name;

  const measure_name = !dept_is_first_column ? 
    is_first_column ? node.data.name : node.parent.data.name :
    !is_first_column ? node.data.name : node.parent.data.name;

  const popup_options = {
    year,
    dept_is_first_column,
    is_dept,
    has_infographic,
    is_budget_measure,
    dept_name,
    measure_name,
    is_first_column,
    color: node.color,
    value: node.__value__,
    value_is_negative: node.__value__ < 0,
    value_is_zero: node.__value__ === 0,
    lang_formated_zero: window.lang === "en" ? "$0" : "0$",
    description: !_.isUndefined(node.data.description) && !_.isEmpty(node.data.description) && node.data.description,
    notes: !_.isUndefined(node.data.notes) && !_.isEmpty(node.data.notes) && node.data.notes,
    chapter: !_.isUndefined(node.data.chapter_key) && budget_chapters[node.data.chapter_key].text,
    budget_link: !_.isUndefined(node.data.chapter_key) && ( (node.data.chapter_key === "oth" && node.data.type !== "net_adjust") || !_.isEmpty(node.data.ref_id) ) && 
      BudgetMeasure.make_budget_link(node.data.chapter_key, node.data.ref_id),
    level: node.data.type,
    id: node.data.id,
    focus_text: node.magnified ? text_maker("partition_unfocus_button") : text_maker("partition_focus_button"),
  };
  return text_maker("budget_measure_popup_template", popup_options);
}

const standard_data_wrapper_node_rules = (node) => {
  const root_value = _.last(node.ancestors()).value;
  node.__value__ = node.value;
  node.open = true;
  node.how_many_to_show = function(_node){
    if (_node.children.length <= 2){ return [_node.children, []] }
    const show = [_.head(_node.children)];
    const hide = _.tail(_node.children);
    const unhide = _.filter(hide, 
      __node => __node.data.type !== "net_adjust" ? 
          Math.abs(__node.value) > root_value/100 :
          false);
    return [show.concat(unhide), _.difference(hide, unhide)];
  }
}

const update_diagram = (diagram, props) => {
  if (props.filter_string){
    update_with_search(diagram, props);
  } else {
    standard_update(diagram, props);
  }
}

const standard_update = (diagram, props) => {
  const data = budget_measures_hierarchy_factory(props.first_column, props.filtered_chapter_keys);
  const dont_fade = [];
  render_diagram(diagram, props, data, standard_data_wrapper_node_rules, dont_fade);
}

const update_with_search = (diagram, props) => {
  const dont_fade = [];
  const search_matching = [];
    
  const search_tree =  budget_measures_hierarchy_factory(props.first_column, props.filtered_chapter_keys);
  const deburred_query = _.deburr(props.filter_string).toLowerCase();

  search_tree.each(node => {
    if (!_.isNull(node.parent)){
      if (
        _.deburr(node.data.name.toLowerCase()) === deburred_query ||
        (node.data.type === "dept" && node.data.id !== 9999) && 
           (
             _.deburr(node.data.acronym.toLowerCase()) === deburred_query ||
             _.deburr(node.data.fancy_acronym.toLowerCase()) === deburred_query ||
             _.deburr(node.data.applied_title.toLowerCase()) === deburred_query
           )
      ) {
        search_matching.push(node);
        dont_fade.push(node);
        _.each(node.children, children => {
          search_matching.push(children);
          dont_fade.push(children);
        });
      } else if (node.data.search_string.indexOf(deburred_query) !== -1){
        search_matching.push(node);
        dont_fade.push(node);
      }
    }
  });

  const to_open = _.chain(search_matching)
    .map(n => n.ancestors())
    .flatten(true)
    .uniq()
    .value();
  const how_many_to_be_shown = node => {
    const partition = _.partition(node.children, child => _.includes(to_open, child));
    return partition;
  };
    
  const search_data_wrapper_node_rules = (node) => {
    node.__value__ = node.value;
    node.open = true;
    node.how_many_to_show = how_many_to_be_shown;
  }

  render_diagram(diagram, props, search_tree, search_data_wrapper_node_rules, dont_fade);
}

const render_diagram = (diagram, props, data, data_wrapper_node_rules, dont_fade) => {
  const displayed_measure_count = _.filter(BudgetMeasure.get_all(), (budgetMeasure) => {
    return _.indexOf(props.filtered_chapter_keys, budgetMeasure.chapter_key) === -1;
  }).length;

  diagram.configure_then_render({
    data,
    formatter,
    level_headers: get_level_headers(props.first_column),
    root_text_func: _.curry(root_text_func)(displayed_measure_count),
    popup_template,
    data_wrapper_node_rules,
    dont_fade,
    colors: [
      "#f6ca7c",
      "#f6987c",
      "#f6857c",
      "#b388ff",
      "#8798f6",
      "#7cd0f6",
      "#b0bec5",
    ],
    background_color: "#9c9c9c",
  });
}

function center_diagram(){
  if (this.refs.outer_container){
    this.refs.outer_container.style.marginLeft = ( -d3.select("main.container").node().offsetLeft + 4 ) + "px";
  }
}

export class BudgetMeasuresPartition extends React.Component {
  constructor(){
    super();
    this.center_diagram = center_diagram.bind(this);
  }
  componentDidMount(){
    window.addEventListener("resize", this.center_diagram);

    this.container = d3.select(ReactDOM.findDOMNode(this.refs.container));
    this.diagram = new PartitionDiagram(this.container, {height: 700});
    update_diagram(this.diagram, this.props);
  }
  shouldComponentUpdate(nextProps){
    update_diagram(this.diagram, nextProps);
    return false;
  }
  componentWillUnmount(){
    window.removeEventListener("resize", this.center_diagram);
  } 
  render(){
    return (
      <div
        ref="outer_container"
        style={{
          marginLeft: ( -d3.select("main.container").node().offsetLeft + 4 ) + "px",
          width: "98vw",
          marginTop: "10px",
        }}
      >
        <div 
          className="budget-measure-partiton-area" 
          ref="container"
        />
      </div>
    );
  }
}