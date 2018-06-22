import { Selector } from 'testcafe'; // first import testcafe selectors

fixture `Main app tests`// declare the fixture
  .page `http://localhost:8080/build/InfoBase/index-eng.html#start`;  // specify the start page



const financial_link_sel = = "#app-focus-root > div > div > div.outer-container-escape-hatch > " +
  "div.inner-container-escape-hatch > div.home-root > div.intro-box > div.container > h2 > span";


//then create a test and place your code there
test('App boots and loads home page data', async t => {
  await t
    // Use the assertion to check if the actual header text is equal to the expected one
    .expect(Selector(financial_link_sel).innerText).contains("Transforming");
});