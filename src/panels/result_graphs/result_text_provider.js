import text from "./result_treemap.yaml";
import {
  create_text_maker,
  TM as StdTM,
} from '../shared.js';

export const text_maker = create_text_maker(text);
export const TM = props => <StdTM tmf={text_maker} {...props} />;
