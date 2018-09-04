/* eslint-disable no-console */

//glob.sync takes a pattern and returns an array of  filenames matching that pattern
//fse just adds the ability to do 'cp -r' to the regular filesystem tools for node
const glob = require('glob');
const fse = require('fs-extra');
const fs = require("fs");
const _ = require("lodash");
const Handlebars = require('handlebars');
const d3_dsv = require('d3-dsv');

global._ = _; //global is the 'window' on the node environment

const { write_result_bundles } = require('./write_result_bundles.js');
const { get_footnote_file_defs } = require('./write_footnote_bundles.js');
const { index_lang_lookups } = require("../src/InfoBase/index_data.js");

/*
This copies stuff into the build directory

webpack makes it easier to handle yaml and css, 
the most complicated parts, so being less data-driven is 
actually simpler now.

PROJ -> {
  (mkdir if doesn't exist) build/, build/PROJ.name/, js/ , csv/ , svg/
  copy PROJ.js to build/PROJ.name/js/ (this will include external dependencies)
  copy WET stuff -r to build/PROJ.name/
  copy other to build/PROJ.name (this is where index-en/fr get copied)
  forEach file in PROJ.spreadsheets, copy it to to build/PROJ.name/csv/
  forEach file  in PROJ.svg, copy to build/PROJ.name/svg/
}


idea for improvement: move project's table list to a json file in src/InfoBase,
then have that be the ONLY source (dynamic requires are possible with webpack) of which tables are in which project

*/
const csv_names_by_table_id = require('../src/tables/table_id_to_csv_map.js');

const external_deps_names = glob.sync('external-dependencies/*.js')

const public_data_dir = "data/";

const public_dir_prefixer = file_name => public_data_dir+file_name;

function file_to_str(path){
  return fs.readFileSync(path).toString('utf8');
}

const common_lookups = _.map(
  [
    //tag lookups are small enough to keep bilingual
    'tags_to_programs.csv',
    'program_tags.csv',
    'program_tag_types.csv',

    //most igoc lookups are small enough to keep bilingual
    'DeptcodetoTableID.csv',
    'org_to_minister.csv',
    'ministers.csv',
    'ministries.csv',
    'inst_forms.csv',
    'url_lookups.csv',
  ], 
  public_dir_prefixer 
);


//these files are big and are explicitly split by the pipeline (bilingual bundles are also used elsewhere, though) 
const lang_specific_lookups = lang => [
  "program",
  "crso",
  "Glossary",
  "igoc",
].map( name => `${name}_${lang}.csv`);

const common_lookups_en = _.map(
  lang_specific_lookups("en"),
  public_dir_prefixer
);

const common_lookups_fr = _.map(
  lang_specific_lookups("fr"),
  public_dir_prefixer
);

const common_png = _.map(['en', 'fr'], lang => `src/panels/result_graphs/result-taxonomy-${lang}.png`);

const common_svg = [
  //home banner
  'src/home/backbanner.svg',
  'src/home/flagline.svg',

  //top left corner brand
  'src/InfoBase/sig-blk-en.svg',
  'src/InfoBase/sig-blk-fr.svg',
  'src/InfoBase/infobase-dev-fip.svg',

  //footer wordmark
  'src/InfoBase/wmms-blk.svg',

  //caricature images for main 5 pages
  'src/home/partition.svg',
  'src/home/partition-budget.svg',
  'src/home/bubbles.svg',
  'src/home/builder.svg',
  'src/home/structure.svg',
  'src/home/explorer.svg',
  'src/home/aboutus.svg',
  'src/home/glossary.svg',
  'src/home/metadata.svg',
  'src/home/compare_estimates.svg',
  'src/home/feedback.svg',

  //simplographic images
  'src/panels/intro_graphs/check.svg',
  'src/panels/intro_graphs/graph.svg',
  'src/panels/intro_graphs/money.svg',
  'src/panels/intro_graphs/employees.svg',

  //small scma icons below home page search bar
  'src/home/results.svg',
  'src/home/expend.svg',
  'src/home/people.svg',

  //search glyph
  'src/search/search.svg',

  //result icons
  'src/panels/result_graphs/attention_req.svg',
  'src/panels/result_graphs/met.svg',
  'src/panels/result_graphs/not_applicable.svg',
  'src/panels/result_graphs/not_available.svg',
  'src/panels/result_graphs/on_track.svg',

  //eye icons
  'src/partition/budget_measures_subapp/eye-close.svg',
  'src/partition/budget_measures_subapp/eye-open.svg',

  //GaaG info icon
  'src/partition/partition_subapp/info.svg',

  //breadcrumb arrow
  'src/core/arrow.svg',

  //accordian chevron
  'src/components/Accordions_chevron.svg',

];

const IB_tables = [
  'table1',
  'table2',
  'table4',
  'table5',
  'table6',
  'table7',
  'table8',
  'table9',
  'table10',
  'table11',
  'table12',
  'table305',
  'table300',
  'table112',
  'table302',
  'table303',
  'table304',
];

var csv_from_table_names = function(table_ids){
  return _.map(table_ids, function(table_id){
    const obj = csv_names_by_table_id[table_id];
    const prefix = public_data_dir;

    return prefix+obj.url;
  });
};

const other_csvs = _.map(
  [
    'budget_measure_data.csv',
    'budget_measure_lookups_en.csv',
    'budget_measure_lookups_fr.csv',
  ],
  public_dir_prefixer
);

var IB = {
  name: 'InfoBase',
  lookups_en: common_lookups.concat(common_lookups_en),
  lookups_fr: common_lookups.concat(common_lookups_fr),
  csv: csv_from_table_names(IB_tables).concat(other_csvs),
  svg: common_svg,
  png: common_png,
  js: external_deps_names,
  well_known: ['src/InfoBase/security.txt'],
  other: [
    'src/robots/robots.txt',
    'src/InfoBase/favicon.ico',
  ],
};

function get_index_pages(){
  const CDN_URL = process.env.CDN_URL || "."; 
  console.log(`CDN_URL: ${CDN_URL}`);
  const template = file_to_str("./src/InfoBase/index.hbs.html");
  const template_func = Handlebars.compile(template);

  const en_lang_lookups = _.mapValues(index_lang_lookups, 'en');
  const fr_lang_lookups = _.mapValues(index_lang_lookups, 'fr');
  _.each([en_lang_lookups, fr_lang_lookups], lookups => lookups.CDN_URL = CDN_URL );

  const a11y_template = file_to_str("./src/InfoBase/index.hbs.html");
  const a11y_template_func = Handlebars.compile(a11y_template);
  
  const get_extended_a11y_args = (lang_lookups) => ({
    ...lang_lookups,
    script_url: lang_lookups.a11y_script_url, 
    other_lang_href: lang_lookups.a11y_other_lang_href,
    is_a11y_mode: true,
  });

  return [
    {
      file_prefix: "index",
      en: template_func(en_lang_lookups),
      fr: template_func(fr_lang_lookups),
    },
    {
      file_prefix: "index-basic",
      en: a11y_template_func( get_extended_a11y_args(en_lang_lookups) ),
      fr: a11y_template_func( get_extended_a11y_args(fr_lang_lookups) ),
    },
  ];
}

function make_dir_if_exists(dir_name){
  if (!fse.existsSync(dir_name)){
    fse.mkdirSync(dir_name);
  }
};

function get_lookup_name(file_name){
  let str = file_name;
  _.each(['_en','_fr'], lang => {
    str = str.split(lang).join("");
  });
  return _.last(str.split('/'));
}

function build_proj(PROJ){
  
  const dir = 'build/InfoBase';
  const app_dir = `${dir}/app`;
  const results_dir = `${dir}/results`;
  const footnotes_dir = `${dir}/footnotes`;
  const well_known_dir = `${dir}/.well-known`;

  _.each(
    ['build', dir, app_dir, results_dir, footnotes_dir], 
    name => make_dir_if_exists(name)
  )

  const bilingual_model_files = {
    depts: "igoc.csv",
    crsos: "crso.csv",
    tag_prog_links: "tags_to_programs.csv",
    programs: "program.csv",

    sub_programs: "subprograms.csv",
    results: "Results.csv",
    indicators: "Indicators.csv",
    PI_DR_links: "pi_dr_links.csv",

    footnotes: "footnotes.csv",
  };

  const parsed_bilingual_models = _.mapValues(bilingual_model_files, file_name => (
    d3_dsv.csvParse(
      _.trim(file_to_str(public_dir_prefixer(file_name)))
    )
  ));

  write_result_bundles(parsed_bilingual_models, results_dir);


  _.each(["en","fr"], lang => {

    const {
      depts: dept_footnotes,
      tags: tag_footnotes,
      global: global_footnotes,
      all: all_footnotes,
      estimates: estimate_footnotes,
    } = get_footnote_file_defs(parsed_bilingual_models, lang);

    _.each( _.merge(dept_footnotes, tag_footnotes), (file_str,subj_id) => {
      fs.writeFileSync(
        `${footnotes_dir}/fn_${lang}_${subj_id}.json.js`,
        file_str
      );
    });

    fs.writeFileSync(
      `${footnotes_dir}/fn_${lang}_all.json.js`,
      all_footnotes
    );

    const est_fn_url = `${footnotes_dir}/fn_${lang}_estimates.json.js`;
    fs.writeFileSync(est_fn_url, estimate_footnotes);

    // combine all the lookups into one big JSON blob
    // also, create a compressed version for modern browsers
    const lookup_json_str = JSON.stringify(
      _.chain(PROJ["lookups_"+lang])
        .map(file_name => [ get_lookup_name(file_name), file_to_str(file_name) ])
        .concat([['global_footnotes', global_footnotes]]) //these should be loaded immediately, so they're included in the base lookups file.
        .fromPairs()
        .value()
    ).toString("utf8");

    fs.writeFileSync(`${dir}/lookups_${lang}.json.js`,lookup_json_str);

  });

  fse.copySync('external-dependencies/GCWeb', dir+'/GCWeb', {clobber: true});

  const copy_file_to_target_dir = (file_name, target_dir) => {
    const small_name = file_name.split('/').pop(); // dir/file.js -> file.js
    console.log('copying:' + small_name);
    fse.copySync(file_name, target_dir+'/'+small_name, {clobber: true});//clobber overwrites old directory when copying
  };

  ['png', 'svg','js','csv'].forEach(function(type){
    var this_dir = dir+'/'+type;
    make_dir_if_exists(this_dir);
    PROJ[type].forEach( f_name => copy_file_to_target_dir(f_name, this_dir) );
  });
  PROJ.well_known.forEach( f_name => copy_file_to_target_dir(f_name, well_known_dir) );
  PROJ.other.forEach( f_name => copy_file_to_target_dir(f_name, dir) );

  _.each(get_index_pages(), ({file_prefix, en, fr }) => {
    fs.writeFileSync(
      `${dir}/${file_prefix}-eng.html`,
      en
    );
    fs.writeFileSync(
      `${dir}/${file_prefix}-fra.html`,
      fr
    );
  });

  console.log("\n done copying static assets \n");
};


build_proj(IB);



