import text from "../services.yaml";
import { service_channels_keys } from "../shared.js";
import { create_text_maker_component, Panel } from "../../../../components";
import { NivoResponsiveHBar } from "../../../../charts/wrapped_nivo";

const { text_maker, TM } = create_text_maker_component(text);

export class ServiceChannels extends React.Component {
  render() {
    const { service } = this.props;
    const colors = infobase_colors();

    const data = _.chain(service_channels_keys)
      .filter((key) =>
        _.reduce(
          service.service_report,
          (previous_is_not_null, report) => {
            const current_is_null = _.isNull(report[`${key}_count`]);
            return previous_is_not_null || !current_is_null;
          },
          false
        )
      )
      .map((key) => ({
        id: key,
        label: text_maker(key),
        [text_maker(key)]: _.reduce(
          service.service_report,
          (sum, report) => sum + report[`${key}_count`],
          0
        ),
      }))
      .value();

    return (
      <Panel title={text_maker("single_service_channels_title")}>
        <TM k="service_channels_text" className="medium_panel_text" />
        <NivoResponsiveHBar
          data={data}
          indexBy="label"
          keys={_.map(service_channels_keys, (key) => text_maker(key))}
          is_money={false}
          colorBy={(d) => colors(d.id)}
          margin={{
            right: 10,
            left: 180,
            top: 0,
            bottom: 50,
          }}
          bttm_axis={{
            tickValues: 6,
          }}
        />
      </Panel>
    );
  }
}
