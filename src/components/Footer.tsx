import React from "react";
import "../styles/footer.css";

export default function Footer() {
  return (
    <footer className="universal-footer">
      <div className="footer-content">
        <div className="footer-left">
          <p>Created by the BYU Family History Technology Lab</p>
          <br />
          <div className="footer-column">
            <h2 className="footer-header">Support Fhtl</h2>
            <ul className="list-unstyled">
              <li>
                <a href="https://familytech.byu.edu/" className="footer-link">
                  Home
                </a>
              </li>
              <li>
                <a href="https://familytech.byu.edu/contact.html" className="footer-link">
                  Contact
                </a>
              </li>
              <li>
                <a href="https://familytech.byu.edu/people.html" className="footer-link">
                  People
                </a>
              </li>
              <li>
                <a href="https://familytech.byu.edu/donate.html" className="footer-link">
                  Donate
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="footer-line"></div>
        <div className="footer-right">
          <h2 className="discover-projects">Discover our Other Projects!</h2>
          <br />
          <div className="footer-columns">
            <div className="footer-column">
              <h2 className="footer-header">Research</h2>
              <ul className="list-unstyled">
                <li>
                  <a href="https://www.relativefinder.org/" className="footer-link">
                    Relative Finder
                  </a>
                </li>
                <li>
                  <a href="http://virtual-pedigree.familytech.byu.edu/" className="footer-link">
                    Virtual Pedigree
                  </a>
                </li>
                <li>
                  <a href="http://descend.familytech.byu.edu/" className="footer-link">
                    Descendancy Explorer
                  </a>
                </li>
                <li>
                  <a href="https://treesweeper.familytech.byu.edu/" className="footer-link">
                    Tree Sweeper
                  </a>
                </li>
              </ul>
            </div>
            <div className="footer-column">
              <h2 className="footer-header">Visualize</h2>
              <ul className="list-unstyled">
                <li>
                  <a href="http://pedigree-pie.familytech.byu.edu/" className="footer-link">
                    Pedigree Pie
                  </a>
                </li>
                <li>
                  <a href="http://opg.familytech.byu.edu/" className="footer-link">
                    One Page Genealogy
                  </a>
                </li>
                <li>
                  <a href="https://calendar.familytech.byu.edu/" className="footer-link">
                    Family Calendar
                  </a>
                </li>
              </ul>
            </div>
            <div className="footer-column">
              <h2 className="footer-header">Play</h2>
              <ul className="list-unstyled">
                <li>
                  <a href="https://geneopardy.familytech.byu.edu/" className="footer-link">
                    Geneopardy
                  </a>
                </li>
                <li>
                  <a href="https://wheel.familytech.byu.edu/" className="footer-link">
                    Wheel of Family Fortune
                  </a>
                </li>
                <li>
                  <a href="https://ancestorgames.familytech.byu.edu/" className="footer-link">
                    Ancestor Games
                  </a>
                </li>
                <li>
                  <a href="https://recordquest.fhtl.byu.edu/" className="footer-link">
                    Record Quest
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
