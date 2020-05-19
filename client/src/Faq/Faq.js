import "./Faq.scss";
import text from "./Faq.yaml";
import { faq_data } from "./faq_data.js";

import {
  StandardRouteContainer,
  ScrollToTargetContainer,
} from "../core/NavComponents.js";
import {
  LabeledTable,
  create_text_maker_component,
  FancyUL,
} from "../components";

const { text_maker, TM } = create_text_maker_component(text);

const FaqIndex = () => (
  <FancyUL ul_class="faq-index">
    {[
      <TM
        key="jump_to_question"
        k="jump_to_question"
        el="h2"
        className="heading-unstyled"
      />,
      ..._.map(faq_data, ({ q }, id) => (
        <a key={id} href={`#faq/${id}`} title={text_maker("jump_to_question")}>
          {q}
        </a>
      )),
    ]}
  </FancyUL>
);

const FaqTable = () => (
  <LabeledTable
    title={<TM k="faq_title" el="h2" className="heading-unstyled" />}
    content={_.map(faq_data, ({ q, a }, id) => ({
      name: <div id={id}>{q}</div>,
      desc: <div dangerouslySetInnerHTML={{ __html: a }} />,
    }))}
  />
);

export default class Faq extends React.Component {
  render() {
    const {
      match: {
        params: { selected_qa_key },
      },
    } = this.props;

    return (
      <StandardRouteContainer
        title={text_maker("faq_page_title")}
        breadcrumbs={[text_maker("faq_page_title")]}
        description={text_maker("faq_page_description")}
        route_key="_faq"
      >
        <TM tmf={text_maker} el="h1" k="faq_page_title" />
        <ScrollToTargetContainer target_id={selected_qa_key}>
          <div className="medium_panel_text">
            <FaqIndex />
            <FaqTable />
          </div>
        </ScrollToTargetContainer>
      </StandardRouteContainer>
    );
  }
}
