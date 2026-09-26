import { useState } from "react";

const DAYS_IN_MONTH = [31, 28, 31, 30, 31, 30, 30, 31, 30, 31, 30, 31];
const MONTH = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]

export default function Calendar() {
    let [d, setD] = useState(new Date());

    let m = d.getMonth();
    d.setDate(1);
    let weekday = d.getDay();

    return (
        <div className="bigbtn bg-base-200 ">
            <div className="flex justify-between">
                <button onClick={() => {
                    let temp = new Date();
                    temp.setMonth(d.getMonth() - 1);
                    setD(temp);
                }} className="btn btn-ghost btn-sm"> prev</button>
                <div className="ml-3 mr-3"><strong>{MONTH[m]}</strong></div>
                <button onClick={() => {
                    let temp = new Date();
                    temp.setMonth(d.getMonth() + 1);
                    setD(temp);
                }} className="btn btn-ghost btn-sm">next</button>
            </div>
            <div className="grid grid-cols-7">
                <div className="ml-4">Sun</div>
                <div className="ml-3">Mon</div>
                <div className="ml-4">Tue</div>
                <div className="ml-2">Wed</div>
                <div className="ml-4">Thu</div>
                <div className="ml-5">Fri</div>
                <div className="ml-4">Sat</div>
                {new Array(weekday).fill(0).map((day, i) => <div></div>)}
                {new Array(DAYS_IN_MONTH[m]).fill(0).map((day, i) =>
                    <div className="btn w-17 h-17 btn-ghost btn-secondary text-lg">{i + 1}</div>
                )}
            </div>
        </div>
    );
}