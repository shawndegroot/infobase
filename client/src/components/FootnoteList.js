import "./FootnoteList.scss";
import footnote_list_text from "./FootnoteList.yaml";
import footnote_topic_text from "../models/footnotes/footnote_topics.yaml";

import { create_text_maker } from "../models/text.js";
import { sanitized_dangerous_inner_html } from "../general_utils.js";

import { FancyUL } from "./FancyUL.js";

const text_maker = create_text_maker([footnote_list_text, footnote_topic_text]);

const is_real_footnote = ({ subject, topic_keys }) =>
  _.isObject(subject) && !_.isEmpty(topic_keys);

// classes don't exist in IE, which we transpile for, so can't directly test if an object is a class or
// an instance of a class. Need heuristics. Working from the assumption that subject instances must
// have id's and subject classes must not
const subject_is_class = ({ id }) => _.isUndefined(id) || id === "gov";
const subject_is_instance = ({ id }) => !_.isUndefined(id) && id !== "gov";

const FootnoteListSubtitle = ({ title }) => <div>{title}</div>; // styling TODO

const SubjectSubtitle = ({ subject }) => {
  if (subject_is_instance(subject) && !_.isUndefined(subject.name)) {
    return (
      <FootnoteListSubtitle
        title={text_maker("subject_footnote_title", {
          subject_name: subject.name,
        })}
      />
    );
  } else if (subject_is_class(subject) && !_.isUndefined(subject.singular)) {
    return (
      <FootnoteListSubtitle
        title={text_maker("global_footnote_title", {
          subject_name: subject.singular,
        })}
      />
    );
  } else {
    // Should fail fast for standard footnote, since the route load tests include the footnote inventory.
    // Might not fail fast if ad-hoc fake footnotes are thrown in a FootnoteList in an obscure panel etc...
    throw new Error(
      `FootnoteList SubjectSubtitle's must be passed valid subject instances or subject classes. ${JSON.stringify(
        subject
      )} is neither.`
    );
  }
};

const years_to_plain_text = (year1, year2) => {
  if (year1 && year2 && year1 !== year2) {
    return text_maker("footnote_years", { year1, year2 });
  } else if (year1 || year2) {
    const year = year1 || year2;
    return text_maker("footnote_year", { year });
  }
};
const topic_keys_to_plain_text = (topic_keys) =>
  _.chain(topic_keys).map(text_maker).sort().value();

const FootnoteMeta = ({ meta_items }) => (
  <div className={"footnote-list__meta_container"}>
    {!_.isEmpty(meta_items) && (
      <div className="footnote-list__meta_label">
        {text_maker("footnote_meta")}
      </div>
    )}
    {_.map(meta_items, (meta_item_text, ix) => (
      <div key={ix} className="footnote-list__meta_item badge">
        {meta_item_text}
      </div>
    ))}
  </div>
);

const FootnoteSublist = ({ footnotes }) => (
  <ul className="list-unstyled">
    {_.chain(footnotes)
      .uniqBy("text")
      .map(({ text, year1, year2, topic_keys }, ix) => (
        <li key={`footnote_${ix}`} className={"footnote-list__item"}>
          <div
            className="footnote-list__note"
            dangerouslySetInnerHTML={sanitized_dangerous_inner_html(text)}
          />
          <FootnoteMeta
            meta_items={_.compact([
              years_to_plain_text(year1, year2),
              ...topic_keys_to_plain_text(topic_keys),
            ])}
          />
        </li>
      ))
      .value()}
  </ul>
);

// sortBy is stable, so sorting by properties in reverse importance order results in the desired final ordering
// note: not sorting by subject, expect that sorting/grouping to happen elsewhere, this is just footnote metadata sorting
const sort_footnotes = (footnotes) =>
  _.chain(footnotes)
    .sortBy(({ topic_keys }) =>
      _.chain(topic_keys).thru(topic_keys_to_plain_text).join(" ").value()
    )
    .sortBy(({ topic_keys }) => -topic_keys.length)
    .sortBy(({ year1, year2 }) => -(year2 || year1 || Infinity))
    .value();

const group_and_sort_footnotes = (footnotes) =>
  _.chain(footnotes)
    .groupBy(({ subject: { id, name, singular } }) =>
      !_.isUndefined(id) ? `${name}_${id}` : singular
    )
    .map((grouped_footnotes, group_name) => {
      return [grouped_footnotes, group_name];
    })
    .sortBy(_.last)
    .map(([grouped_footnotes]) => sort_footnotes(grouped_footnotes))
    .value();

const FootnoteList = ({ footnotes }) => {
  const { true: real_footnotes, false: fake_footnotes } = _.groupBy(
    footnotes,
    is_real_footnote
  );

  const {
    true: class_wide_footnotes,
    false: instance_specific_footnotes,
  } = _.groupBy(real_footnotes, ({ subject }) => subject_is_class(subject));

  const class_footnotes_grouped_and_sorted = group_and_sort_footnotes(
    class_wide_footnotes
  );
  const instance_footnotes_grouped_and_sorted = group_and_sort_footnotes(
    instance_specific_footnotes
  );

  return (
    <div className={"footnote-list"}>
      <FancyUL>
        {[
          ..._.chain(class_footnotes_grouped_and_sorted)
            .concat(instance_footnotes_grouped_and_sorted)
            .map((footnotes, ix) => (
              <div key={`${ix}`}>
                <SubjectSubtitle subject={footnotes[0].subject} />
                <FootnoteSublist footnotes={footnotes} />
              </div>
            ))
            .value(),
          !_.isEmpty(fake_footnotes) && (
            <div key={"other"}>
              <FootnoteListSubtitle title={text_maker("other")} />
              <FootnoteSublist footnotes={footnotes} />
            </div>
          ),
        ]}
      </FancyUL>
    </div>
  );
};

export { FootnoteList };
