import { mix, staticStoreMixin } from "../storeMixins.js";

class CovidEstimates extends mix().with(staticStoreMixin) {
  static create_and_register(covid_estimates_row) {
    const inst = new CovidEstimates(covid_estimates_row);
    this.register(covid_estimates_row.id, inst);
    return inst;
  }
  constructor(covid_estimates_row) {
    super();
    _.assign(this, {
      ...covid_estimates_row,
      org_id: +covid_estimates_row.org_id,
    });
  }

  static org_lookup(org_id) {
    return _.filter(
      CovidEstimates.get_all(),
      ({ org_id: row_org_id }) => row_org_id === org_id
    );
  }
}

export { CovidEstimates };
