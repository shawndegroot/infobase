import marked from 'marked';
import { mix } from '../generalUtils.js';
import { staticStoreMixin } from './staticStoreMixin.js';
import { trivial_text_maker } from './text.js';

class GlossaryEntry extends mix().with(staticStoreMixin) {
  constructor(id,title,def_text){
    super();
    this.id = id;
    this.title = title;
    if(_.isEmpty(def_text)){
      this.no_def = true;
    } else {
      this._def_text = def_text;
    }
    //this.compiled = false;
  }
  get definition(){ 
    if(this.no_def){
      /* eslint-disable no-console*/
      window.is_dev_build && console.warn("definition for non-defined concept"); 
      return "";
    }
    return compiled_definitions(this.id);
  }
  static query(query){
    const results = super.query(query);
    return _.reject(results, 'no_def');
  }
  static get fully_defined_entries(){
    return _.reject(this.get_all(), 'no_def');
  }
}

const compiled_definitions = _.memoize( glossary_id => marked(GlossaryEntry.lookup(glossary_id)._def_text) );

const glossary_display = item => `<div>
  <span class="sr-only"> A definition follows </span>
  <header class="agnostic-header agnostic-header--medium-weight"> ${trivial_text_maker('definition')} : ${item.title} </header>
  <div>${item.definition}</div>
</div>`;

const get_glossary_item_tooltip_html = key => glossary_display(GlossaryEntry.lookup(key));

window._DEV_HELPERS.GlossaryEntry = GlossaryEntry;

class TopicGlossaryEntry extends GlossaryEntry {
  constructor(id,title,def_text,topic){
    super(id,title,def_text);
    this.topic = topic;
  }
  
}

export { 
  GlossaryEntry,
  get_glossary_item_tooltip_html,
}; 



