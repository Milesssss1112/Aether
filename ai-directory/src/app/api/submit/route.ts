import { NextResponse } from "next/server";

type SubmitPayload = {
  name?: string;
  url?: string;
  description?: string;
};

export async function POST(request: Request) {
  const payload = (await request.json()) as SubmitPayload;
  const name = payload.name?.trim() ?? "";
  const url = payload.url?.trim() ?? "";
  const description = payload.description?.trim() ?? "";

  if (name.length < 2) {
    return NextResponse.json({ message: "工具名称至少 2 个字符。" }, { status: 400 });
  }
  if (!/^https?:\/\/.+/i.test(url)) {
    return NextResponse.json({ message: "请填写合法的官网链接（http/https）。" }, { status: 400 });
  }
  if (description.length < 8) {
    return NextResponse.json({ message: "工具描述至少 8 个字符。" }, { status: 400 });
  }

  return NextResponse.json({
    ok: true,
    message: "已收到提交信息。",
    data: {
      id: `pending-${Date.now()}`,
      name,
      url,
      description,
      status: "pending",
    },
  });
}
