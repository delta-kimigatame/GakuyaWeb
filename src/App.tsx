import * as React from "react";
import {World} from "tsworld"
export const App: React.FC = () => {
    const world=new World()
    const loadWorld = async()=>{
        await world.Initialize()
    }
    React.useMemo(()=>{
        loadWorld()
    },[])
    return <></>
}