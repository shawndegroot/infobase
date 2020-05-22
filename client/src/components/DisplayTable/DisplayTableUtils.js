import "./DisplayTableUtils.scss";
import text from "./DisplayTable.yaml";

import { Fragment } from "react";

import { create_text_maker_component } from "../misc_util_components.js";
import { WriteToClipboard } from "../WriteToClipboard.js";
import { IconCopy, IconDownload } from "../../icons/icons.js";

const { text_maker } = create_text_maker_component(text);

export const DisplayTableCopy = ({ csv_string }) => (
  <WriteToClipboard
    text_to_copy={csv_string}
    button_class_name={"display_table__util-icon"}
    button_description={text_maker("copy_table_data_desc")}
    IconComponent={IconCopy}
    icon_color={window.infobase_color_constants.backgroundColor}
  />
);

const download_csv = (csv_string, table_name) => {
  const uri = "data:text/csv;charset=UTF-8," + encodeURIComponent(csv_string);

  const temporary_anchor = document.createElement("a");
  temporary_anchor.setAttribute(
    "download",
    `${table_name ? table_name : text_maker("table")}.csv`
  );
  temporary_anchor.setAttribute("href", uri);
  temporary_anchor.dispatchEvent(new MouseEvent("click"));
};
export const DisplayTableDownload = ({ csv_string, table_name }) => (
  <Fragment>
    {!window.feature_detection.is_IE() && (
      <button
        onClick={() => download_csv(csv_string, table_name)}
        className={"display_table__util-icon"}
      >
        <IconDownload
          title={text_maker("download_table_data_desc")}
          color={window.infobase_color_constants.backgroundColor}
        />
      </button>
    )}
  </Fragment>
);