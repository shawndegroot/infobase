import _ from "lodash";

import { assign_to_dev_helper_namespace } from "src/core/assign_to_dev_helper_namespace.js";

import { CovidEstimates } from "./covid/CovidEstimates.js";
import { CovidInitiatives } from "./covid/CovidInitiatives.js";
import { CovidMeasures } from "./covid/CovidMeasures.js";
import {
  Gov,
  Dept,
  CRSO,
  Program,
  InstForm,
  Ministry,
  Minister,
} from "./organizational_entities.js";
import { Result, Indicator } from "./results.js";
import { Tag } from "./tags.js";

const Subject = {
  Gov,
  Dept,
  CRSO,
  Program,
  InstForm,
  Ministry,
  Minister,
  Tag,
  Result,
  Indicator,
  CovidEstimates,
  CovidInitiatives,
  CovidMeasures,
};

Subject.get_by_guid = function get_by_guid(guid) {
  if (!_.isString(guid)) {
    return null;
  }
  let [model_type, model_id] = guid.split("_");
  return Subject[model_type] && Subject[model_type].lookup(model_id);
};

// Duplicate keys in all lower case, for legacy reasons
_.each(Subject, (subject_item, key) => {
  const lower_case_key = _.toLower(key);
  if (_.chain(Subject).keys().indexOf(lower_case_key).value() === -1) {
    Subject[lower_case_key] = subject_item;
  }
});

assign_to_dev_helper_namespace({ Subject });

export { Subject };
