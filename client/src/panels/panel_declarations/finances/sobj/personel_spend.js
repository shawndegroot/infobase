import { GraphOverlay } from "../../../../components";
import {
  declare_panel,
  year_templates,
  businessConstants,
  util_components,
  A11yTable,
  StdPanel,
  Col,
  WrappedNivoLine,
  run_template,
} from "../../shared.js";

import { text_maker, TM } from "./sobj_text_provider.js";
const { sos } = businessConstants;
const { std_years } = year_templates;
const { Format } = util_components;

export const declare_personnel_spend_panel = () =>
  declare_panel({
    panel_key: "personnel_spend",
    levels: ["gov"],
    panel_config_func: (level, panel_key) => ({
      depends_on: ["orgSobjs"],

      info_deps: ["orgSobjs_gov_info"],

      calculate(subject, info, data) {
        return {
          series: {
            "0": std_years.map(
              (year) =>
                this.tables.orgSobjs.horizontal(year, false)[sos[1].text]
            ),
          },
        };
      },

      render({ calculations, footnotes, sources }) {
        const { info, panel_args } = calculations;

        let graph_content;
        if (window.is_a11y_mode) {
          graph_content = (
            <A11yTable
              data_col_headers={[text_maker("spending")]}
              data={_.chain(std_years)
                .map(run_template)
                .zip(panel_args.series["0"])
                .map(([label, amt]) => ({
                  label,
                  data: <Format type="compact1_written" content={amt} />,
                }))
                .value()}
            />
          );
        } else {
          const personnel_data = () => [
            {
              id: "Personnel",
              data: _.map(
                panel_args.series[0],
                (spending_data, year_index) => ({
                  y: spending_data,
                  x: run_template(std_years[year_index]),
                })
              ),
            },
          ];

          graph_content = (
            <div position="relative">
              <GraphOverlay>
                <WrappedNivoLine
                  raw_data={panel_args.series[0]}
                  data={personnel_data()}
                  margin={{
                    top: 50,
                    right: 40,
                    bottom: 50,
                    left: 65,
                  }}
                  colors={window.infobase_color_constants.primaryColor}
                />
              </GraphOverlay>
            </div>
          );
        }

        return (
          <StdPanel
            title={text_maker("personnel_spend_title")}
            {...{ footnotes, sources }}
          >
            <Col size={5} isText>
              <TM k="personnel_spend_text" args={info} />
            </Col>
            <Col size={7} isGraph>
              {graph_content}
            </Col>
          </StdPanel>
        );
      },
    }),
  });
