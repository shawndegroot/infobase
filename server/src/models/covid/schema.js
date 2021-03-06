import _ from "lodash";

import { bilingual_field } from "../schema_utils";

const schema = `
  extend type Root{
    covid_estimates: [CovidEstimates]
    covid_initiatives: [CovidInitiative]
    covid_measures: [CovidMeasure]
  }

  extend type Gov{
    covid_estimates_summary: [CovidEstimatesSummary]
  }
  type CovidEstimatesSummary{
    id: String

    fiscal_year: String
    est_doc: String
    vote: Float
    stat: Float
  }

  extend type Org{
    covid_estimates: [CovidEstimates]
    covid_initiatives: [CovidInitiative]
  }

  type CovidEstimates{
    id: String
    
    org_id: Int

    fiscal_year: String
    est_doc: String
    vote: Float
    stat: Float
  }

  type CovidInitiative{
    id: String
    name: String

    estimates: [CovidInitiativeEstimates]
  }

  type CovidInitiativeEstimates{
    id: String

    org_id: Int

    covid_initiative_id: [String]
    covid_initiative: CovidInitiative

    fiscal_year: String
    est_doc: String
    vote: Float
    stat: Float

    covid_measure_ids: [String]
    covid_measures: [CovidMeasure]
  }

  type CovidMeasure{
    id: String
    name: String
  }
`;

export default function ({ models, loaders }) {
  const { CovidInitiative, CovidMeasure, CovidEstimates } = models;

  const {
    covid_initiatives_by_org_id_loader,
    covid_measure_loader,
    covid_estimates_by_org_id_loader,
  } = loaders;

  const resolvers = {
    Root: {
      covid_initiatives: () => CovidInitiative.find({}),
      covid_measures: () => CovidMeasure.find({}),
      covid_estimates: () =>
        CovidEstimates.find({ org_id: { $not: { $eq: "gov" } } }),
    },
    Gov: {
      covid_estimates_summary: () =>
        covid_estimates_by_org_id_loader.load("gov"),
    },
    Org: {
      covid_initiatives: ({ org_id }) =>
        covid_initiatives_by_org_id_loader.load(org_id),
      covid_estimates: ({ org_id }) =>
        covid_estimates_by_org_id_loader.load(org_id),
    },
    CovidInitiative: {
      id: _.property("covid_initiative_id"),
      name: bilingual_field("name"),
    },
    CovidInitiativeEstimates: {
      covid_measures: ({ covid_measure_ids }) => {
        return covid_measure_ids
          ? covid_measure_loader.loadMany(covid_measure_ids)
          : [];
      },
    },
    CovidMeasure: {
      id: _.property("measure_id"),
      name: bilingual_field("name"),
    },
  };

  return {
    schema,
    resolvers,
  };
}
