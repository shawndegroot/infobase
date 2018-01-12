import gql from 'graphql-tag';

const Component = ({ data: { programs } }) => <div>
  <ul>
    {_.map(programs, ({is_internal_service},ix) =>
      <li key={ix}>
        Internal Service ? { is_internal_service ? "true" : "false"}
      </li>
    )}
  </ul>
</div>;


const query = gql`
  query($lang: String!, $id: String!) {
    root(lang: $lang){
      org(org_id:$id){
        programs {
          is_internal_service
        }
      }
    }
  }
`

function data_to_props({ root: { org: { programs  }} }){
  return { programs };
}

export default {
  key: "example2",
  query,
  component: Component,
  data_to_props, //we don't use the data at this layer, we just take advantage of the side-effect for cache to be pre-loaded
};