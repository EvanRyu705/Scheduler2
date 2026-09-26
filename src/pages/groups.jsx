import { useState, useEffect } from 'react';
import Calendar from '../components/calendar';
export default function GroupsPage() {


    return (
        <div className="flex-grow">
            <div className="grid grid-cols-3 h-171 group">
                <div className="bg-base-200 ">
                    <div className="m-3 btn w-70">New Group</div>

                </div>
                <div>
                    
                </div>
                <div className="bg-gray-300"></div>
                <div className="flex justify-center items-center bg-gray-100"><button className="btn btn-square bg-base-200">+</button><input type="text" placeholder="Type here" class="input" /><button className="btn btn-circle bg-primary w-8 h-8 text-white">🡱</button></div>
                <div className="flex justify-center items-center">
                    <Calendar />
                </div>
            </div>

        </div>

    );
}