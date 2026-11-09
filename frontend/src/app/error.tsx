'use client';

import { Button, Result } from "antd";

export default function ErrorPage({reset}: {error: Error, reset: () => void}){
    return (
        <Result 
        status="error"
        title="There is something wrong!"
        subTitle="Can not connect to server, please try again!"
        extra={<Button type="primary" onClick={reset}>Try again</Button>}/>
    );

}