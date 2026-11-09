import { Skeleton } from "antd";

export default function Loading(){
    return (
        <div style={{maxWidth: 1200, margin:'0 auto', padding: 24}}>
            <Skeleton active paragraph={{rows: 8}}></Skeleton>
        </div>
    )
}