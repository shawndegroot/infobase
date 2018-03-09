const {
  formats,
  text_maker,
  run_template,
  PanelGraph,
  create_ppl_share_pie,
  create_height_clipped_graph_with_legend,
  D3,
  years : {people_years},
  business_constants : { gender },
} = require("../shared"); 

const employee_gender_render = function(panel, data){
  const {graph_args} = data;
  
  const ticks = _.map(people_years, y => `${run_template(y)}`);

  if (!window.is_a11y_mode){
    if (this.level === "dept" || window.is_a11y_mode){
      const create_graph_with_legend_options = {
        legend_col_full_size : 4,
        graph_col_full_size : 8,
        graph_col_class : "height-clipped-bar-area",
        legend_class : 'fcol-sm-11 fcol-md-11',
        y_axis : text_maker("employees"),
        ticks : ticks,
        height : this.height,
        bar : true,
        stacked : false,
        yaxis_formatter : formats["big_int_real_raw"],
        legend_title : "employee_gender",
        get_data : _.property("data"),
        data : graph_args,
      };     
      
      // Inserts new row under the text/pie chart row containing bar graph, collapsed by a HeightCliper.
      create_height_clipped_graph_with_legend(panel,create_graph_with_legend_options);
    }

    // Create and render % share pie chart, either to the right of or below panel text
    create_ppl_share_pie({
      pie_area : panel.areas().graph,
      graph_args, 
      label_col_header : text_maker("employee_gender"),
    });
  } else {
    D3.create_a11y_table({
      container: panel.areas().text.node(), 
      label_col_header: text_maker("age_group"), 
      data_col_headers: [...ticks, text_maker("five_year_percent_header")], 
      data: _.map(graph_args, dimension => { 
        return {label: dimension.label, data: [...dimension.data, formats["percentage1_raw"](dimension.five_year_percent)]} 
      }),
    });
  }
};

new PanelGraph({
  level: "dept",
  depends_on : ['table302'],

  key : "historical_employee_gender",

  info_deps: [
    'table302_dept_info',
  ],

  layout : {
    full : {text : 12, graph: 12},
    half: {text : 12, graph: 12},
  },

  text: "dept_historical_employee_gender_text",
  title: "historical_employee_gender_title",

  calculate(dept,info){
    const {table302} = this.tables;
    return table302.q(dept).data
      .map(row =>
        ({
          label : row.gender,
          data : people_years.map(year =>row[year]),
          five_year_percent : row.five_year_percent,
          active : true,
        })
      )
      .filter(d => d3.sum(d.data) !== 0 );
  },

  render: employee_gender_render,
});

new PanelGraph({
  level: "gov",
  depends_on : ['table302'],
  key : "historical_employee_gender",

  info_deps: [
    'table302_gov_info',
  ],

  layout : {
    full : {text : 12, graph: 12},
    half: {text : 12, graph: 12},
  },

  text: "gov_historical_employee_gender_text",
  title:"historical_employee_gender_title",

  calculate(gov,info){
    const {table302} = this.tables;
    
    const gov_five_year_total_head_count =_.chain(table302.q().gov_grouping())
      .map(row => d3.sum(_.drop(row)))
      .reduce((sum, val) => sum + val, 0)
      .value();

    return _.values(gender)
      .map(gender_type => {
        const gender_text = gender_type.text;
        const yearly_values = people_years.map(year => table302.horizontal(year,false)[gender_text]);
        return {
          label : gender_text,
          data :  yearly_values,
          five_year_percent : yearly_values.reduce(function(sum, val) { return sum + val;}, 0)/gov_five_year_total_head_count,
          active : true,
        };
      });
  },

  render: employee_gender_render,
});

