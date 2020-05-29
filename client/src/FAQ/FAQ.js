import "./FAQ.scss";
import text from "./FAQ.yaml";
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

const FAQIndex = () => (
  <FancyUL
    className="faq-index"
    title={text_maker("jump_to_question")}
    TitleComponent={({ children }) => (
      <h2 className="heading-unstyled">{children}</h2>
    )}
  >
    {_.map(faq_data, ({ q }, id) => (
      <a key={id} href={`#faq/${id}`} title={text_maker("jump_to_question")}>
        {q}
      </a>
    ))}
  </FancyUL>
);

const FAQTable = () => (
  <LabeledTable
    title={text_maker("faq_title")}
    TitleComponent={({ children }) => (
      <h2 className="heading-unstyled">{children}</h2>
    )}
    contents={_.map(faq_data, ({ q, a }, id) => ({
      id: id,
      label: q,
      content: <div dangerouslySetInnerHTML={{ __html: a }} />,
    }))}
  />
);

export default class FAQ extends React.Component {
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
            <FAQIndex />
            <FAQTable />
          </div>
        </ScrollToTargetContainer>
      </StandardRouteContainer>
    );
  }
}