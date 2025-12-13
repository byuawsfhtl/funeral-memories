import { useNavigate } from "react-router-dom";
import { useState } from "react";
import "../styles/home.css";

export default function Home() {
	const navigate = useNavigate();
	const [hostHover, setHostHover] = useState(false);

	return (

		<main>
			<div className="hero">
				<div className="hero-left">
					<p className="tagline">Share and honor the memories of your loved ones</p>
					<button className="new-button"><a href="/instructions">New? Click here to get started!</a></button>
				</div>
				<div className="hero-right">
					<button className="join-button" onClick={() => navigate("/roleSelect")}>
						Join a Group
					</button>
					<button className="new-g-button" onClick={() => navigate("/host")}>
						Host a New Group
					</button>
				</div>
			</div>

			{/* icons from https://icon-sets.iconify.design/ */}
			<div className="cards-section">
				<h2 className="how-it-works">How It Works</h2>
				<div className="cards-container">

					<div className="card">
						<svg className="card-icon" xmlns="http://www.w3.org/2000/svg" width="50%" height="50%" viewBox="0 0 24 24">
							<path fill="#1C495E" d="M6 22q-.825 0-1.412-.587T4 20V4q0-.825.588-1.412T6 2h7.175q.4 0 .763.15t.637.425l4.85 4.85q.275.275.425.638t.15.762V20q0 .825-.587 1.413T18 22zm7-14q0 .425.288.713T14 9h4l-5-5zm-2 7v2q0 .425.288.713T12 18t.713-.288T13 17v-2h2q.425 0 .713-.288T16 14t-.288-.712T15 13h-2v-2q0-.425-.288-.712T12 10t-.712.288T11 11v2H9q-.425 0-.712.288T8 14t.288.713T9 15z" />
						</svg>
						<h3>Create a Memory Page</h3>
						<p>Insert description here</p>
					</div>

					<div className="arrow">
						<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 24 24">
							<path fill="#1C495E" d="M2.25 12c0 5.385 4.365 9.75 9.75 9.75s9.75-4.365 9.75-9.75S17.385 2.25 12 2.25S2.25 6.615 2.25 12m10.22-4.03a.75.75 0 0 1 1.06 0l3.5 3.5a.75.75 0 0 1 0 1.06l-3.5 3.5a.75.75 0 1 1-1.06-1.06l2.22-2.22H7.5a.75.75 0 0 1 0-1.5h7.19l-2.22-2.22a.75.75 0 0 1 0-1.06" />
						</svg>
					</div>

					<div className="card">
						<svg className="card-icon" xmlns="http://www.w3.org/2000/svg" width="50%" height="50%" viewBox="0 0 16 16"><g fill="#1C495E">
							<path d="M1 14s-1 0-1-1s1-4 6-4s6 3 6 4s-1 1-1 1zm5-6a3 3 0 1 0 0-6a3 3 0 0 0 0 6" /><path fill-rule="evenodd" d="M13.5 5a.5.5 0 0 1 .5.5V7h1.5a.5.5 0 0 1 0 1H14v1.5a.5.5 0 0 1-1 0V8h-1.5a.5.5 0 0 1 0-1H13V5.5a.5.5 0 0 1 .5-.5" /></g>
						</svg>
						<h3>Share with friends</h3>
						<p>Insert description here</p>
					</div>

					<div className="arrow">
						<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 24 24">
							<path fill="#1C495E" d="M2.25 12c0 5.385 4.365 9.75 9.75 9.75s9.75-4.365 9.75-9.75S17.385 2.25 12 2.25S2.25 6.615 2.25 12m10.22-4.03a.75.75 0 0 1 1.06 0l3.5 3.5a.75.75 0 0 1 0 1.06l-3.5 3.5a.75.75 0 1 1-1.06-1.06l2.22-2.22H7.5a.75.75 0 0 1 0-1.5h7.19l-2.22-2.22a.75.75 0 0 1 0-1.06" />
						</svg>
					</div>

					<div className="card">
						<svg className="card-icon" xmlns="http://www.w3.org/2000/svg" width="50%" height="50%" viewBox="0 0 24 24">
							<path fill="#1C495E" d="M14 9.9V8.2q.825-.35 1.688-.525T17.5 7.5q.65 0 1.275.1T20 7.85v1.6q-.6-.225-1.213-.337T17.5 9q-.95 0-1.825.238T14 9.9m0 5.5v-1.7q.825-.35 1.688-.525T17.5 13q.65 0 1.275.1t1.225.25v1.6q-.6-.225-1.213-.338T17.5 14.5q-.95 0-1.825.225T14 15.4m0-2.75v-1.7q.825-.35 1.688-.525t1.812-.175q.65 0 1.275.1T20 10.6v1.6q-.6-.225-1.213-.338T17.5 11.75q-.95 0-1.825.238T14 12.65m-1 4.4q1.1-.525 2.213-.788T17.5 16q.9 0 1.763.15T21 16.6V6.7q-.825-.35-1.713-.525T17.5 6q-1.175 0-2.325.3T13 7.2zM12 20q-1.2-.95-2.6-1.475T6.5 18q-1.05 0-2.062.275T2.5 19.05q-.525.275-1.012-.025T1 18.15V6.1q0-.275.138-.525T1.55 5.2q1.175-.575 2.413-.888T6.5 4q1.45 0 2.838.375T12 5.5q1.275-.75 2.663-1.125T17.5 4q1.3 0 2.538.313t2.412.887q.275.125.413.375T23 6.1v12.05q0 .575-.487.875t-1.013.025q-.925-.5-1.937-.775T17.5 18q-1.5 0-2.9.525T12 20" />
						</svg>
						<h3>Share Photos and Stories</h3>
						<p>Insert description here</p>
					</div>
				</div>
			</div>

			<br />
			<br />
			<br />
		</main>
	);
}
