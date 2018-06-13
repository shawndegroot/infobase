const metadata_text = require("./metadata.yaml");
const { 
  StandardRouteContainer,
  ScrollToTargetContainer,
} = require('../core/NavComponents.js');
const {create_text_maker} = require('../models/text');
const { 
  TM: StandardTM,
  FancyUL,
}  = require('../util_components.js');
const { sources } = require('./data_sources.js');
const {
  Panel,
} = require('../components/panel-components.js');
const { months } = require('../models/businessConstants');

const FormattedDate = ({ day, month, year}) => <span>{months[month].text} {year}</span>;

const tmf = create_text_maker(metadata_text);
const TM = props => <StandardTM tmf={tmf} {...props} />

export class MetaData extends React.Component {
  render(){
    const { 
      match: {
        params : {
          data_source,
        },
      },
    } = this.props;

    const sorted_sources = _.sortBy(sources, source => source.title()); 

    return (
      <StandardRouteContainer
        title={tmf("metadata")}
        breadcrumbs={[tmf("metadata")]}
        description={tmf("metadata_document_description")}
        route_key="_metadata"
      >
        <div>
          <h1><TM k="metadata"/></h1>
        </div>
        <p> <TM k='metadata_t'/> </p>
        <ScrollToTargetContainer target_id={data_source}>
          {_.map(sorted_sources, (source) => (
            <div key={source.key} id={source.key}>
              <Panel
                title={source.title()}
                subtitle={
                  <span><TM k="refresh_freq"/> {source.frequency.text}</span>
                }
              >
                <div>
                  { source.description() }
                </div>
                <div className="h4"> <TM k='datasets' /> </div>
                <FancyUL>
                  {_.map(source.items(), ({key, id, text, inline_link, external_link }) => (
                    <span key={key || id} className="fancy-ul-span-flex">
                      { 
                        inline_link ? 
                        <a 
                          title={tmf('rpb_link_text')}
                          href={inline_link}
                          style={{alignSelf: "center"}}
                        >
                          {text}
                        </a>  :
                        <span
                          style={{alignSelf: "center"}}
                        >
                          {text}
                        </span> 
                      }
                      {
                        external_link &&
                        <a 
                          target="_blank" 
                          className="btn btn-xs btn-ib-primary btn-responsive-fixed-width" 
                          href={external_link}
                        >
                          <TM k="open_data_link"/>
                        </a>
                      }
                    </span>
                  ))}
                </FancyUL>
                <div className="fancy-ul-span-flex">
                  <div style={{opacity: 0.8 }}> 
                    <TM k="last_refresh" /> {FormattedDate(source.last_updated)}
                  </div>
                  { source.open_data &&
                    <a 
                      style={{marginLeft:'auto'}} //fix a flexbox bug
                      className="btn btn-ib-primary" 
                      target="_blank" 
                      href={source.open_data[window.lang]}
                    > 
                      <TM k='open_data_link' /> 
                    </a>
                  }
                </div>
              </Panel>
            </div>
          ))}
        </ScrollToTargetContainer>
      </StandardRouteContainer>
    );
  }
};