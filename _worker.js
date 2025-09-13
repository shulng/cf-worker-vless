import { connect } from "cloudflare:sockets";
let 哎呀呀这是我的VL密钥 = "25284107-7424-40a5-8396-cdd0623f4f05";
let 反代IP = "ProxyIP.Vultr.CMLiussss.net";
export default {
  async fetch(访问请求) {
    const 读取我的请求标头 = 访问请求.headers.get("Upgrade");
    if (!读取我的请求标头 || 读取我的请求标头 !== "websocket") {
      return new Response(null, { status: 404 });
    } else if (读取我的请求标头 === "websocket") {
      return await 升级WS请求(访问请求);
    }
    return new Response(null, { status: 404 });
  },
};
async function 升级WS请求(访问请求) {
  const 创建WS接口 = new WebSocketPair();
  const [客户端, WS接口] = Object.values(创建WS接口);
  const 读取我的加密访问内容数据头 = 访问请求.headers.get("sec-websocket-protocol");
  const 解密数据 = 使用64位加解密(读取我的加密访问内容数据头);
  await 解析VL标头(解密数据, WS接口);
  return new Response(null, { status: 101, webSocket: 客户端 });
}
function 使用64位加解密(还原混淆字符) {
  还原混淆字符 = 还原混淆字符.replace(/-/g, "+").replace(/_/g, "/");
  const 解密数据 = atob(还原混淆字符);
  const 解密_你_个_丁咚_咙_咚呛 = Uint8Array.from(解密数据, (c) => c.charCodeAt(0));
  return 解密_你_个_丁咚_咙_咚呛.buffer;
}
async function 解析VL标头(VL数据, WS接口, TCP接口) {
  if (验证VL的密钥(new Uint8Array(VL数据.slice(1, 17))) !== 哎呀呀这是我的VL密钥) {
    return new Response(null, { status: 400 });
  }
  const 获取数据定位 = new Uint8Array(VL数据)[17];
  const 提取端口索引 = 18 + 获取数据定位 + 1;
  const 建立端口缓存 = VL数据.slice(提取端口索引, 提取端口索引 + 2);
  const 访问端口 = new DataView(建立端口缓存).getUint16(0);
  const 提取地址索引 = 提取端口索引 + 2;
  const 建立地址缓存 = new Uint8Array(VL数据.slice(提取地址索引, 提取地址索引 + 1));
  const 识别地址类型 = 建立地址缓存[0];
  let 地址长度 = 0;
  let 访问地址 = "";
  let 地址信息索引 = 提取地址索引 + 1;
  switch (识别地址类型) {
    case 1:
      地址长度 = 4;
      访问地址 = new Uint8Array(VL数据.slice(地址信息索引, 地址信息索引 + 地址长度)).join(".");
      break;
    case 2:
      地址长度 = new Uint8Array(VL数据.slice(地址信息索引, 地址信息索引 + 1))[0];
      地址信息索引 += 1;
      访问地址 = new TextDecoder().decode(VL数据.slice(地址信息索引, 地址信息索引 + 地址长度));
      break;
    case 3:
      地址长度 = 16;
      const dataView = new DataView(VL数据.slice(地址信息索引, 地址信息索引 + 地址长度));
      const ipv6 = [];
      for (let i = 0; i < 8; i++) {
        ipv6.push(dataView.getUint16(i * 2).toString(16));
      }
      访问地址 = ipv6.join(":");
      break;
    default:
      return new Response(null, { status: 400 });
  }
  const 写入初始数据 = VL数据.slice(地址信息索引 + 地址长度);
  try {
    TCP接口 = connect({ hostname: 访问地址, port: 访问端口, allowHalfOpen: true });
    await TCP接口.opened;
  } catch {
    const [反代IP地址, 反代IP端口 = 访问端口] = 反代IP.split(":");
    TCP接口 = connect({ hostname: 反代IP地址, port: 反代IP端口, allowHalfOpen: true });
  }
  建立传输管道(WS接口, TCP接口, 写入初始数据);
}
function 验证VL的密钥(arr, offset = 0) {
  const uuid = (转换密钥格式[arr[offset + 0]] + 转换密钥格式[arr[offset + 1]] + 转换密钥格式[arr[offset + 2]] + 转换密钥格式[arr[offset + 3]] + "-" + 转换密钥格式[arr[offset + 4]] + 转换密钥格式[arr[offset + 5]] + "-" + 转换密钥格式[arr[offset + 6]] + 转换密钥格式[arr[offset + 7]] + "-" + 转换密钥格式[arr[offset + 8]] + 转换密钥格式[arr[offset + 9]] + "-" + 转换密钥格式[arr[offset + 10]] + 转换密钥格式[arr[offset + 11]] + 转换密钥格式[arr[offset + 12]] + 转换密钥格式[arr[offset + 13]] + 转换密钥格式[arr[offset + 14]] + 转换密钥格式[arr[offset + 15]]).toLowerCase();
  return uuid;
}
const 转换密钥格式 = [];
for (let i = 0; i < 256; ++i) {
  转换密钥格式.push((i + 256).toString(16).slice(1));
}
async function 建立传输管道(WS接口, TCP接口, 写入初始数据) {
  WS接口.accept();
  WS接口.send(new Uint8Array([0, 0]));
  const 传输数据 = TCP接口.writable.getWriter();
  const 数据流 = new ReadableStream({
    async start(控制器) {
      if (写入初始数据) {
        控制器.enqueue(写入初始数据);
        写入初始数据 = null;
      }
      WS接口.addEventListener("message", (event) => 控制器.enqueue(event.data));
      WS接口.addEventListener("close", () => 控制器.close());
      WS接口.addEventListener("error", () => 控制器.close());
    },
  });
  数据流.pipeTo(
    new WritableStream({
      async write(VL数据) {
        await 传输数据.write(VL数据);
      },
    })
  );
  TCP接口.readable.pipeTo(
    new WritableStream({
      async write(VL数据) {
        await WS接口.send(VL数据);
      },
    })
  );
}
