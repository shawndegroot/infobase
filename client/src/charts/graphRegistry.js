// This is more or less a legacy utility! Consider not using it, and working towards refactoring the remaining graphs relying on it.

// Initializes old graph classes with a common set of D3 dispatchers and some properties such as their available width and height, then
// stores all currently rendered graphs in a registry so that a single onResize event can be used to trigger all of their re-renders
// (updating their available width and height properties first)

class GraphRegistry {
  constructor(){
    this.registry = [];
    this.window_width_last_updated_at = window.innerWidth;

    window.addEventListener(
      "hashchange", 
      _.debounce(function(){ 
        GraphRegistry.update_registry();
      }, 250)
    );

    window.addEventListener(
      "resize", 
      _.debounce(function(){
        if ( this.should_graphs_update() ){
          GraphRegistry.update_registry();
          GraphRegistry.update_graphs();
        }
      }, 250)
    );
  }
  
  should_graphs_update(){
    return window.innerWidth !== this.window_width_last_updated_at;
  }

  update_registry(){
    var new_registry = this.registry.filter(
      (graph_obj) => document.body.contains( graph_obj.html.node() ) 
    );
    this.registry = new_registry;
  }

  update_graphs(){
    this.window_width_last_updated_at = window.innerWidth;

    this.registry.forEach( (graph_obj) => {
      graph_obj.outside_width = graph_obj.html.node().offsetWidth;
      graph_obj.outside_height = graph_obj.options.height || 400;

      // Remove all labels associated with the graph (that is, all siblings of the svg's container).
      // Graphs with "preserve_labels_on_update" must be re-rendered with all labels intact, so nothing is removed here.
      const html_container = graph_obj.html.node();
      const preserve_labels = !_.isNull( html_container.querySelector("[preserve_labels_on_update]") );
      if (!preserve_labels){
        // forEach directly on this nodeList is spoty, mapping it through to an array first works consistently though
        _.map(html_container.childNodes, _.identity) 
          .forEach(
            child => {
              if ( !_.isUndefined(child) && !child.className.includes("__svg__") ){
                html_container.removeChild(child);
              }
            }
          );
      }

      graph_obj.render(graph_obj.options);
    });
  }

  setup_graph_instance(instance, container, options = {}){
    var base_dispatch_events = [
      "renderBegin",
      "renderEnd",
      'dataMouseEnter',
      'dataMouseLeave',
      'dataFocusIn',
      "dataFocusOut",
      "dataClick",
      "dataHover",  
      "dataHoverOut",
    ];
  
    instance.options = options;
  
    container
      .attr("aria-hidden", "true")
      .append("div")
      .classed("__svg__", true);
  
    if (options.alternative_svg){
      container.select(".__svg__").html(options.alternative_svg);
    } else {
      container.select(".__svg__").append("svg");    
    }
  
    instance.svg = container.select("svg");
    instance.outside_width = container.node().offsetWidth;
    instance.outside_height = options.height || 400;
  
    instance.html = container; 
  
    instance.dispatch = options.dispatch = d3.dispatch.apply(
      this,
      base_dispatch_events.concat(options.events || [])
    );
  
    this.registry.push(instance);
  }
};

const graphRegistry = new GraphRegistry;
export default graphRegistry;