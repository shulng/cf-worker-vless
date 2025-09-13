import { connect } from "cloudflare:sockets";

//////////////////////////////////////////////////////////////////////////配置区块////////////////////////////////////////////////////////////////////////
let 哎呀呀这是我的ID啊 = "shulng"; // 订阅路径
let 哎呀呀这是我的VL密钥 = "25284107-7424-40a5-8396-cdd0623f4f05"; // UUID

let 我的优选 = []; // 节点列表
let 我的优选TXT = ["https://raw.githubusercontent.com/shulng/shulng/refs/heads/main/ip.txt"]; // 优选TXT路径

let 反代IP = "ProxyIP.Vultr.CMLiussss.net";

let 我的节点名字 = "水灵"; // 节点名字

//////////////////////////////////////////////////////////////////////////网页入口////////////////////////////////////////////////////////////////////////
export default {
  async fetch(访问请求) {
    const 读取我的请求标头 = 访问请求.headers.get("Upgrade");
    const url = new URL(访问请求.url);
    if (!读取我的请求标头 || 读取我的请求标头 !== "websocket") {
      if (我的优选TXT.length > 0) {
        const 唯一值集合 = new Set(我的优选);

        for (const 文本地址 of 我的优选TXT) {
          const 响应 = await fetch(文本地址);
          const 文本内容 = await 响应.text();
          const 行数组 = 文本内容
            .split("\n")
            .map((行) => 行.trim())
            .filter((行) => 行);

          行数组.forEach((行) => 唯一值集合.add(行));
        }

        我的优选 = Array.from(唯一值集合);
      }
      if (url.pathname === `/${哎呀呀这是我的ID啊}`) {
        const 用户代理 = 访问请求.headers.get("User-Agent").toLowerCase();
        const 主机名 = 访问请求.headers.get("Host");

        const 配置生成器 = {
          v2ray: 生成通用配置,
          clash: 生成猫咪配置,
          default: (host) => btoa(unescape(encodeURIComponent(生成通用配置(host)))),
        };
        const 工具 = Object.keys(配置生成器).find((工具) => 用户代理.includes(工具)) || "default";
        const 生成配置 = 配置生成器[工具];

        return new Response(生成配置(主机名), {
          status: 200,
          headers: { "Content-Type": "text/plain;charset=utf-8" },
        });
      }
      return new Response(null, { status: 404 });
    } else if (读取我的请求标头 === "websocket") {
      return await 升级WS请求(访问请求);
    }
    return new Response(null, { status: 404 });
  },
};
////////////////////////////////////////////////////////////////////////脚本主要架构//////////////////////////////////////////////////////////////////////
//第一步，读取和构建基础访问结构
async function 升级WS请求(访问请求) {
  const 创建WS接口 = new WebSocketPair();
  const [客户端, WS接口] = Object.values(创建WS接口);
  const 读取我的加密访问内容数据头 = 访问请求.headers.get("sec-websocket-protocol"); //读取访问标头中的WS通信数据
  const 解密数据 = 使用64位加解密(读取我的加密访问内容数据头); //解密目标访问数据，传递给TCP握手进程
  await 解析VL标头(解密数据, WS接口); //解析VL数据并进行TCP握手
  return new Response(null, { status: 101, webSocket: 客户端 }); //一切准备就绪后，回复客户端WS连接升级成功
}
function 使用64位加解密(还原混淆字符) {
  还原混淆字符 = 还原混淆字符.replace(/-/g, "+").replace(/_/g, "/");
  const 解密数据 = atob(还原混淆字符);
  const 解密_你_个_丁咚_咙_咚呛 = Uint8Array.from(解密数据, (c) => c.charCodeAt(0));
  return 解密_你_个_丁咚_咙_咚呛.buffer;
}
//第二步，解读VL协议数据，创建TCP握手
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
//第三步，创建客户端WS-CF-目标的传输通道并监听状态
async function 建立传输管道(WS接口, TCP接口, 写入初始数据) {
  // 向客户端发送WS握手认证信息
  WS接口.accept();
  WS接口.send(new Uint8Array([0, 0]));

  // 获取TCP接口可写端的写入器
  const 传输数据 = TCP接口.writable.getWriter();

  // 监听WS接口数据并发送给TCP接口
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

  // 将客户端接收到的WS数据直接发往TCP接口
  数据流.pipeTo(
    new WritableStream({
      async write(VL数据) {
        await 传输数据.write(VL数据);
      },
    })
  );

  // 将TCP接口返回的数据直接通过WS接口发送回客户端
  TCP接口.readable.pipeTo(
    new WritableStream({
      async write(VL数据) {
        await WS接口.send(VL数据);
      },
    })
  );
}

//////////////////////////////////////////////////////////////////////////订阅页面////////////////////////////////////////////////////////////////////////
let 转码 = "vl",
  转码2 = "ess",
  符号 = "://";
function 生成通用配置(hostName) {
  if (我的优选.length === 0) {
    我的优选 = [`${hostName}:443`];
  }
  return 我的优选
    .map((获取优选) => {
      const [主内容, tls] = 获取优选.split("@");
      const [地址端口, 节点名字 = 我的节点名字] = 主内容.split("#");
      const 拆分地址端口 = 地址端口.split(":");
      const 端口 = 拆分地址端口.length > 1 ? Number(拆分地址端口.pop()) : 443;
      const 地址 = 拆分地址端口.join(":");
      const TLS开关 = tls === "notls" ? "security=none" : "security=tls";
      return `${转码}${转码2}${符号}${哎呀呀这是我的VL密钥}@${地址}:${端口}?encryption=none&${TLS开关}&sni=${hostName}&type=ws&host=${hostName}&path=%2F%3Fed%3D2560#${节点名字}`;
    })
    .join("\n");
}
function 生成猫咪配置(hostName) {
  if (我的优选.length === 0) {
    我的优选 = [`${hostName}:443`];
  }
  const 生成节点 = (我的优选) => {
    return 我的优选.map((获取优选) => {
      const [主内容, tls] = 获取优选.split("@");
      const [地址端口, 节点名字 = 我的节点名字] = 主内容.split("#");
      const 拆分地址端口 = 地址端口.split(":");
      const 端口 = 拆分地址端口.length > 1 ? Number(拆分地址端口.pop()) : 443;
      const 地址 = 拆分地址端口.join(":").replace(/^\[|\]/g, "");
      const TLS开关 = tls === "notls" ? "false" : "true";
      return {
        nodeConfig: `  - name: "${节点名字}-${地址}-${端口}"
    type: ${转码}${转码2}
    server: ${地址}
    port: ${端口}
    uuid: ${哎呀呀这是我的VL密钥}
    udp: false
    tls: ${TLS开关}
    network: ws
    servername: ${hostName}
    ws-opts:
      path: "/?ed=2560"
      headers:
        Host: ${hostName}`,
        proxyConfig: `      - "${节点名字}-${地址}-${端口}"`,
      };
    });
  };
  const 节点配置 = 生成节点(我的优选)
    .map((node) => node.nodeConfig)
    .join("\n");
  const 代理配置 = 生成节点(我的优选)
    .map((node) => node.proxyConfig)
    .join("\n");
  return `
dns:
  enable: true
  ipv6: true
  listen: 0.0.0.0:1053
  enhanced-mode: fake-ip
  nameserver:
    - 223.5.5.5
  fallback:
    - 8.8.8.8

proxies:
${节点配置}
proxy-groups:
  - name: "自动选择"
    type: url-test
    url: "https://www.google.com/generate_204"
    interval: 30
    tolerance: 50
    proxies:
${代理配置}
rules:
  - GEOSITE,cn,DIRECT
  - GEOIP,cn,DIRECT
  - MATCH,自动选择
`;
}
