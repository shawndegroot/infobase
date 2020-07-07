import text from "./service_standards.yaml";
import {
  create_text_maker_component,
  Panel,
  DisplayTable,
} from "../../../../components";
import { newIBCategoryColors } from "../../shared.js";
import { IconAttention, IconCheck } from "../../../../icons/icons.js";

const { text_maker, TM } = create_text_maker_component(text);

const color_scale = d3
  .scaleOrdinal()
  .domain(["standard_met", "standard_not_met"])
  .range(_.take(newIBCategoryColors, 2));

export class ServiceStandards extends React.Component {
  render() {
    const { service } = this.props;
    const standards = service.standards;
    const data = _.chain(standards)
      .map(({ name, standard_type, channel, standard_report }) =>
        _.map(standard_report, ({ year, count, met_count }) => ({
          name: name,
          year: year,
          standard_type: standard_type,
          channel: channel,
          count: count,
          met_count: met_count,
          //TODO need is_target_met field from Titan
          is_target_met: count === met_count,
        }))
      )
      .flatten()
      .value();
    const column_configs = {
      name: {
        index: 0,
        header: text_maker("standard_name"),
      },
      year: {
        index: 1,
        header: text_maker("year"),
      },
      standard_type: {
        index: 2,
        header: text_maker("standard_type"),
      },
      channel: {
        index: 3,
        header: text_maker("standard_channel"),
      },
      count: {
        index: 4,
        header: text_maker("stanndard_count"),
      },
      met_count: {
        index: 5,
        header: text_maker("stanndard_met_count"),
      },
      is_target_met: {
        index: 6,
        header: text_maker("stanndard_status"),
        formatter: (value) =>
          value ? (
            <IconCheck
              key="met"
              title={text_maker("standard_met")}
              color={color_scale("standard_met")}
              width={38}
              vertical_align={"0em"}
              alternate_color={false}
              inline={false}
            />
          ) : (
            <IconAttention
              key="not_met"
              title={text_maker("standard_not_met")}
              color={color_scale("standard_not_met")}
              width={38}
              vertical_align={"0em"}
              alternate_color={false}
              inline={false}
            />
          ),
      },
    };
    return (
      <Panel title={text_maker("service_standards_title")}>
        <TM className="medium_panel_text" k="service_standards_text" />
        <DisplayTable data={data} column_configs={column_configs} />
      </Panel>
    );
  }
}
