import { Button, Result } from "antd";
import Link from "next/link";

export default function NotFound(){
    return (
        <Result
        status="404"
        title="Not Found"
        subTitle="Template/Sample is not found!"
        extra={<Link href="/"><Button type="primary">Back</Button></Link>}></Result>
    );
}