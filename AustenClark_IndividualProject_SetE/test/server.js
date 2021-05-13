let server = require("../server");
let chai = require("chai");
let chaiHttp = require("chai-http");
chai.should();
chai.use(chaiHttp); 
const { expect } = chai;
var assert = chai.assert;


//Import complete


describe("Server!", () => {
      // Add your test cases here
      it("Returns the default welcome message", done => {
        chai
          .request(server)
          .get("/")
          .end((err, res) => {
            expect(res).to.have.status(200);
            expect(res.body.status).to.equals("success");
            assert.strictEqual(res.body.message, "Welcome!");
            done();
          });
      });

      it("Returns the API returned something", done =>{
        chai
          .request(server)
          .get("/reviews")
          .end((err, res) => {
            expect(res.body).to.not.be(null);
            done();
          });
      });
});