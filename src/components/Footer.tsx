import "bootstrap/dist/css/bootstrap.min.css";

export default function Footer() {
  return (
    <footer
      className="container-fluid text-white mt-auto d-none d-md-block"
      style={{ backgroundColor: "rgb(13 106 95)" }}
    >
      <div className="row">
        <div className="col-md-3 mt-4">
          <h2 className="h5 text-uppercase">Support Fhtl</h2>
          <ul className="list-unstyled">
            <li>
              <a
                href="https://familytech.byu.edu/"
                className="text-white text-decoration-none"
              >
                Home
              </a>
            </li>
            <li>
              <a
                href="https://familytech.byu.edu/contact.html"
                className="text-white text-decoration-none"
              >
                Contact
              </a>
            </li>
            <li>
              <a
                href="https://familytech.byu.edu/people.html"
                className="text-white text-decoration-none"
              >
                People
              </a>
            </li>
            <li>
              <a
                href="https://familytech.byu.edu/donate.html"
                className="text-white text-decoration-none"
              >
                Donate
              </a>
            </li>
          </ul>
        </div>
        <div className="col-md-3 mt-4">
          <h2 className="h5 text-uppercase">Research</h2>
          <ul className="list-unstyled">
            <li>
              <a
                href="https://www.relativefinder.org/"
                className="text-white text-decoration-none"
              >
                Relative Finder
              </a>
            </li>
            <li>
              <a
                href="http://virtual-pedigree.familytech.byu.edu/"
                className="text-white text-decoration-none"
              >
                Virtual Pedigree
              </a>
            </li>
            <li>
              <a
                href="http://descend.familytech.byu.edu/"
                className="text-white text-decoration-none"
              >
                Descendancy Explorer
              </a>
            </li>
            <li>
              <a
                href="https://treesweeper.familytech.byu.edu/"
                className="text-white text-decoration-none"
              >
                Tree Sweeper
              </a>
            </li>
          </ul>
        </div>
        <div className="col-md-3 mt-4">
          <h2 className="h5 text-uppercase">Visualize</h2>
          <ul className="list-unstyled">
            <li>
              <a
                href="http://pedigree-pie.familytech.byu.edu/"
                className="text-white text-decoration-none"
              >
                Pedigree Pie
              </a>
            </li>
            <li>
              <a
                href="http://opg.familytech.byu.edu/"
                className="text-white text-decoration-none"
              >
                One Page Genealogy
              </a>
            </li>
            <li>
              <a
                href="https://calendar.familytech.byu.edu/"
                className="text-white text-decoration-none"
              >
                Family Calendar
              </a>
            </li>
          </ul>
        </div>
        <div className="col-md-3 mt-4">
          <h2 className="h5 text-uppercase">Play</h2>
          <ul className="list-unstyled">
            <li>
              <a
                href="https://geneopardy.familytech.byu.edu/"
                className="text-white text-decoration-none"
              >
                Geneopardy
              </a>
            </li>
            <li>
              <a
                href="https://wheel.familytech.byu.edu/"
                className="text-white text-decoration-none"
              >
                Wheel of Family Fortune
              </a>
            </li>
            <li>
              <a
                href="https://ancestorgames.familytech.byu.edu/"
                className="text-white text-decoration-none"
              >
                Ancestor Games
              </a>
            </li>
            <li>
              <a
                href="https://recordquest.fhtl.byu.edu/"
                className="text-white text-decoration-none"
              >
                Record Quest
              </a>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
