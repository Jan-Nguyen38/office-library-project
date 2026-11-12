'use client';

import { Button } from "antd";
import { PrinterOutlined } from "@ant-design/icons";

export default function PrintButton() {
    return <Button icon={<PrinterOutlined />} onClick={() => window.print()}>Print / PDF</Button>;
}
