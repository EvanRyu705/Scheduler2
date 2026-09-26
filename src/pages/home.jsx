
import { useState, useEffect } from 'react';
import Calendar from '../components/calendar';


export default function HomePage() {
    let days = new Array(30).fill(0).map((v, i) => <div className="btn btn-soft btn-primary">{i + 1}</div>)
    let [month, setMonth] = useState("September")
    let [rank, setRank] = useState(["a", "b", "c"]);
    let [rankings, setRankings] = useState([
        {
            name: "evan",
            points: 70
        },
        {
            name: "eric",
            points: 60
        },
        {
            name: "becca",
            points: 65
        },
    ]);

    rankings.sort((a, b) => b.points - a.points);








    return (
        <div className="flex-grow flex flex-col justify-center items-center">
            <div className="flex">
                <Calendar />
                <div className="bigbtn bg-base-200 ml-30 h-400">
                    <div className="flex"><strong>Leaderboard</strong></div>
                    <ul class="list flex flex-col">
                        {rankings.map((r, i) =>
                            <li class="list-row">
                                <div class="text-4xl font-thin tabular-nums">{i + 1}</div>
                                <div className="avatar">
                                    <div className="w-16 rounded-full">
                                        <img alt="Tailwind-CSS-Avatar-component" src="https://img.daisyui.com/images/profile/demo/yellingcat@192.webp" />
                                    </div>
                                </div>
                                <div class="list-col-grow">
                                    <div class="flex items-center text-xl">{r.name} - {r.points} points</div>
                                </div>
                            </li>
                        )}
                    </ul>
                </div>
            </div>
        </div>
    );
}