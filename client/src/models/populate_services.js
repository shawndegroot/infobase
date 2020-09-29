import { get_client } from "../graphql_utils/graphql_utils.js";
import gql from "graphql-tag";
import { log_standard_event } from "../core/analytics.js";
import { Service, ServiceStandard, ServiceStats } from "./services.js";

const get_subject_has_services_query = (level, id_arg_name) => gql`
query($lang: String! $id: String) {
  root(lang: $lang) {
    ${level}(${id_arg_name}: $id){
      id
      hasServices: has_services
    }
  }
}
`;
const _subject_has_services = {};
export function api_load_subject_has_services(subject) {
  const level = subject && subject.level;

  const { is_loaded, id, query, response_data_accessor } = (() => {
    const subject_is_loaded = ({ level, id }) =>
      _.get(_subject_has_services, `${level}.${id}`);

    switch (level) {
      case "dept":
        return {
          is_loaded: subject_is_loaded(subject),
          id: subject.id,
          query: get_subject_has_services_query("org", "org_id"),
          response_data_accessor: (response) => response.data.root.org,
        };
      case "program":
        return {
          is_loaded: subject_is_loaded(subject),
          id: subject.id,
          query: get_subject_has_services_query("program", "id"),
          response_data_accessor: (response) => {
            return response.data.root.program;
          },
        };
      default:
        return {
          is_loaded: true, // no default case, this is to resolve the promise early
        };
    }
  })();

  if (is_loaded) {
    // ensure that subject.has_data matches _subject_has_services, since _subject_has_services hay have been updated via side-effect
    subject.set_has_data(
      `services_data`,
      _.get(_subject_has_services, `${level}.${id}`)
    );
    return Promise.resolve();
  }

  const time_at_request = Date.now();
  const client = get_client();
  return client
    .query({
      query,
      variables: {
        lang: window.lang,
        id,
        _query_name: "subject_has_services",
      },
    })
    .then((response) => {
      const response_data = response_data_accessor(response);

      const resp_time = Date.now() - time_at_request;
      if (!_.isEmpty(response_data)) {
        // Not a very good test, might report success with unexpected data... ah well, that's the API's job to test!
        log_standard_event({
          SUBAPP: window.location.hash.replace("#", ""),
          MISC1: "API_QUERY_SUCCESS",
          MISC2: `Has services, took ${resp_time} ms`,
        });
      } else {
        log_standard_event({
          SUBAPP: window.location.hash.replace("#", ""),
          MISC1: "API_QUERY_UNEXPECTED",
          MISC2: `Has services, took ${resp_time} ms`,
        });
      }

      subject.set_has_data(`services_data`, response_data[`hasServices`]);

      // Need to use _.setWith and pass Object as the customizer function to account for keys that may be numbers (e.g. dept id's)
      // Just using _.set makes large empty arrays when using a number as an accessor in the target string, bleh
      _.setWith(
        _subject_has_services,
        `${level}.${id}`,
        response_data[`hasServices`],
        Object
      );

      return Promise.resolve();
    })
    .catch(function (error) {
      const resp_time = Date.now() - time_at_request;
      log_standard_event({
        SUBAPP: window.location.hash.replace("#", ""),
        MISC1: "API_QUERY_FAILURE",
        MISC2: `Has services, took ${resp_time} ms - ${error.toString()}`,
      });
      throw error;
    });
}

const dept_service_fragment = `org_id
      services: services {
        service_id
        org_id
        program_ids

        first_active_year
        last_active_year
        is_active      

        name
        description
        service_type
        scope
        target_groups
        feedback_channels
        urls

        last_gender_analysis

        collects_fees
        account_reg_digital_status
        authentication_status
        application_digital_status
        decision_digital_status
        issuance_digital_status
        issue_res_digital_status
        digital_enablement_comment

        service_report {
          service_id
          year
          cra_business_ids_collected
          sin_collected
          phone_inquiry_count
          online_inquiry_count
          online_application_count
          live_application_count
          mail_application_count
          other_application_count
          service_report_comment
        }

        standards {
          standard_id
          service_id
      
          name
      
          last_gcss_tool_year
          channel
          type
          other_type_comment
      
          target_type
          urls
          rtp_urls
          standard_report {
            standard_id
            year
            lower
            count
            met_count
            is_target_met
            standard_report_comment
          }
        }
      }
  `;

const dept_services_query = gql`
query($lang: String!, $id: String) {
  root(lang: $lang) {
    org(org_id: $id) {
      id
      ${dept_service_fragment}
    }
  }
}
`;

const all_services_query = gql`
query($lang: String!) {
  root(lang: $lang) {
    orgs {
      ${dept_service_fragment}
    }
  }
}
`;
const gov_service_stats_query = gql`
  query($lang: String!) {
    root(lang: $lang) {
      gov {
        service_general_stats {
          num_of_services
        }
        service_type_stats {
          id
          label
          value
        }
      }
    }
  }
`;
const dept_service_stats_query = gql`
  query($lang: String!, $id: String) {
    root(lang: $lang) {
      org(org_id: $id) {
        service_general_stats {
          num_of_services
        }
        service_type_stats {
          id
          label
          value
        }
      }
    }
  }
`;
const program_service_stats_query = gql`
  query($lang: String!, $id: String) {
    root(lang: $lang) {
      program(id: $id) {
        service_general_stats {
          num_of_services
        }
        service_type_stats {
          id
          label
          value
        }
      }
    }
  }
`;

const extract_flat_data_from_hierarchical_response = (response) => {
  const serviceStandards = [];
  const services = _.chain(_.isArray(response) ? response : [response])
    .map((resp) => resp.services)
    .compact()
    .flatten(true)
    .each((service) =>
      _.each(service.standards, (standard) =>
        serviceStandards.push(_.omit(standard, "__typename"))
      )
    )
    .value();
  return { services, serviceStandards };
};
export function api_load_service_stats(subject) {
  if (ServiceStats.get_data(subject)) {
    return Promise.resolve();
  }
  const { query, response_accessor } = (() => {
    switch (subject.level) {
      case "gov":
        return {
          response_accessor: (response) => response.data.root.gov,
          query: {
            query: gov_service_stats_query,
            variables: {
              lang: window.lang,
              _query_name: "gov_service_stats",
            },
          },
        };
      case "dept":
        return {
          response_accessor: (response) => response.data.root.org,
          query: {
            query: dept_service_stats_query,
            variables: {
              lang: window.lang,
              id: _.toString(subject.id),
              _query_name: "dept_service_stats",
            },
          },
        };
      case "program":
        return {
          response_accessor: (response) => response.data.root.program,
          query: {
            query: program_service_stats_query,
            variables: {
              lang: window.lang,
              id: _.toString(subject.id),
              _query_name: "program_service_stats",
            },
          },
        };
    }
  })();
  const client = get_client();
  return client.query(query).then((response) => {
    const service_stats = response_accessor(response);
    if (!_.isEmpty(service_stats)) {
      ServiceStats.set_data(subject, service_stats);
    }
    return Promise.resolve();
  });
}

const _subject_ids_with_loaded_services = {};
export function api_load_services(subject) {
  const level = (subject && subject.level) || "gov";

  const { is_loaded, id, query, response_data_accessor } = (() => {
    const subject_is_loaded = ({ level, id }) =>
      _.get(_subject_ids_with_loaded_services, `${level}.${id}`);

    const all_is_loaded = () => subject_is_loaded({ level: "gov", id: "gov" });
    const dept_is_loaded = (org) => all_is_loaded() || subject_is_loaded(org);

    switch (level) {
      case "dept":
        return {
          is_loaded: dept_is_loaded(subject),
          id: subject.id,
          query: dept_services_query,
          response_data_accessor: (response) => response.data.root.org,
        };
      default:
        return {
          is_loaded: all_is_loaded(subject),
          id: "gov",
          query: all_services_query,
          response_data_accessor: (response) => response.data.root.orgs,
        };
    }
  })();

  if (is_loaded) {
    return Promise.resolve();
  }

  const time_at_request = Date.now();
  const client = get_client();
  return client
    .query({
      query,
      variables: {
        lang: window.lang,
        id,
        _query_name: "services",
      },
    })
    .then((response) => {
      const response_data = response_data_accessor(response);

      const resp_time = Date.now() - time_at_request;
      if (!_.isEmpty(response_data)) {
        // Not a very good test, might report success with unexpected data... ah well, that's the API's job to test!
        log_standard_event({
          SUBAPP: window.location.hash.replace("#", ""),
          MISC1: "API_QUERY_SUCCESS",
          MISC2: `Services, took ${resp_time} ms`,
        });
      } else {
        log_standard_event({
          SUBAPP: window.location.hash.replace("#", ""),
          MISC1: "API_QUERY_UNEXPECTED",
          MISC2: `Services, took ${resp_time} ms`,
        });
      }

      const {
        services,
        serviceStandards,
      } = extract_flat_data_from_hierarchical_response(response_data);

      if (!_.isEmpty(services)) {
        _.each(services, (service) => Service.create_and_register(service));
      }
      if (!_.isEmpty(serviceStandards)) {
        _.each(serviceStandards, (standard) =>
          ServiceStandard.create_and_register(standard)
        );
      }

      // Need to use _.setWith and pass Object as the customizer function to account for keys that may be numbers (e.g. dept id's)
      // Just using _.set makes large empty arrays when using a number as an accessor in the target string, bleh
      _.setWith(
        _subject_ids_with_loaded_services,
        `${level}.${id}`,
        true,
        Object
      );

      // side effect
      _.setWith(
        _subject_ids_with_loaded_services,
        `${level}.${id}`,
        _.isEmpty(services),
        Object
      );

      return Promise.resolve();
    })
    .catch(function (error) {
      const resp_time = Date.now() - time_at_request;
      log_standard_event({
        SUBAPP: window.location.hash.replace("#", ""),
        MISC1: "API_QUERY_FAILURE",
        MISC2: `Services, took ${resp_time} ms - ${error.toString()}`,
      });
      throw error;
    });
}
