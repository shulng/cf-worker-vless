import { connect } from "cloudflare:sockets";
//////////////////////////////////////////////////////////////////////////配置区块////////////////////////////////////////////////////////////////////////
let 哎呀呀这是我的ID啊 = "shulng"; // 订阅路径
let 哎呀呀这是我的VL密钥 = "25284107-7424-40a5-8396-cdd0623f4f05"; // UUID

let 我的优选 = []; // 节点列表
let 我的优选TXT = ["https://raw.githubusercontent.com/shulng/shulng/refs/heads/main/ip.txt"]; // 优选TXT路径

let 反代IP = "ts.hpc.tw:443"; // 反代IP或域名

let 启用SOCKS5全局反代 = false; // 启用SOCKS5全局反代
let 我的SOCKS5账号 = "shulng:shulng@188.68.234.53:21440"; // SOCKS5账号

let 我的节点名字 = "水灵"; // 节点名字

//////////////////////////////////////////////////////////////////////////网页入口////////////////////////////////////////////////////////////////////////
export default {
  async fetch(访问请求, env) {
    const 读取我的请求标头 = 访问请求.headers.get("Upgrade");
    const url = new URL(访问请求.url);
    if (!读取我的请求标头 || 读取我的请求标头 !== "websocket") {
      if (我的优选TXT.length > 0) {
        我的优选 = [
          ...new Set(
            (
              await Promise.all(
                我的优选TXT.map(async (url) => {
                  const response = await fetch(url);
                  return response.ok
                    ? (await response.text())
                        .split("\n")
                        .map((line) => line.trim())
                        .filter((line) => line)
                    : [];
                })
              )
            ).flat()
          ),
        ];
      }
      if (url.pathname === `/${哎呀呀这是我的ID啊}`) {
        const 用户代理 = 访问请求.headers.get("User-Agent").toLowerCase();
        const 配置生成器 = {
          v2ray: 给我通用配置文件,
          clash: 给我小猫咪配置文件,
        };
        const 工具 = Object.keys(配置生成器).find((工具) => 用户代理.includes(工具));
        const 生成配置 = 配置生成器[工具];
        return new Response(生成配置(访问请求.headers.get("Host")), {
          status: 200,
          headers: { "Content-Type": "text/plain;charset=utf-8" },
        });
      }
    } else if (读取我的请求标头 === "websocket") {
      return await 升级WS请求(访问请求);
    }
  },
};
////////////////////////////////////////////////////////////////////////脚本主要架构//////////////////////////////////////////////////////////////////////
//第一步，读取和构建基础访问结构
async function 升级WS请求(访问请求) {
  const 创建WS接口 = new WebSocketPair();
  const [客户端, WS接口] = Object.values(创建WS接口);
  WS接口.accept();
  const 读取我的加密访问内容数据头 = 访问请求.headers.get("sec-websocket-protocol");
  const 解密数据 = 使用64位加解密(读取我的加密访问内容数据头); //解密目标访问数据，传递给TCP握手进程
  const { TCP接口, 写入初始数据 } = await 解析VL标头(解密数据); //解析VL数据并进行TCP握手
  建立传输管道(WS接口, TCP接口, 写入初始数据);
  return new Response(null, { status: 101, webSocket: 客户端 });
}
function 使用64位加解密(还原混淆字符) {
  还原混淆字符 = 还原混淆字符.replace(/-/g, "+").replace(/_/g, "/");
  const 解密数据 = atob(还原混淆字符);
  const 解密_你_个_丁咚_咙_咚呛 = Uint8Array.from(解密数据, (c) => c.charCodeAt(0));
  return 解密_你_个_丁咚_咙_咚呛.buffer;
}
//第二步，解读VL协议数据，创建TCP握手
async function 解析VL标头(VL数据, TCP接口) {
  if (验证VL的密钥(new Uint8Array(VL数据.slice(1, 17))) !== 哎呀呀这是我的VL密钥) {
    return null;
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
  }
  const 写入初始数据 = VL数据.slice(地址信息索引 + 地址长度);
  if (启用SOCKS5全局反代 && 我的SOCKS5账号) {
    TCP接口 = await 创建SOCKS5接口(识别地址类型, 访问地址, 访问端口);
  } else {
    try {
      TCP接口 = await connect({ hostname: 访问地址, port: 访问端口 });
      await TCP接口.opened;
    } catch {
      if (我的SOCKS5账号) {
        try {
          TCP接口 = await 创建SOCKS5接口(识别地址类型, 访问地址, 访问端口);
          await TCP接口.opened;
        } catch {
          if (反代IP) {
            let [反代IP地址, 反代IP端口] = 反代IP.split(":");
            TCP接口 = await connect({ hostname: 反代IP地址, port: 反代IP端口 || 访问端口 });
          }
        }
      } else if (反代IP) {
        let [反代IP地址, 反代IP端口] = 反代IP.split(":");
        TCP接口 = await connect({ hostname: 反代IP地址, port: 反代IP端口 || 访问端口 });
      }
    }
  }
  return { TCP接口, 写入初始数据 };
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
  const 传输数据 = TCP接口.writable.getWriter();
  await WS接口.send(new Uint8Array([0, 0]).buffer); //向客户端发送WS握手认证信息
  TCP接口.readable.pipeTo(
    new WritableStream({
      //将TCP接口返回的数据通过WS接口发送回客户端【优先建立客户端与CF的WS回传通道，防止初始包返回数据时通道任未建立导致丢失数据】
      async write(VL数据) {
        await WS接口.send(VL数据);
      },
    })
  );
  const 数据流 = new ReadableStream({
    //监听WS接口数据并发送给数据流
    async start(控制器) {
      if (写入初始数据) {
        控制器.enqueue(写入初始数据);
        写入初始数据 = null;
      }
      WS接口.addEventListener("message", (event) => {
        控制器.enqueue(event.data);
      }); //监听客户端WS接口消息，推送给数据流
      WS接口.addEventListener("close", () => {
        控制器.close();
      }); //监听客户端WS接口关闭信息，结束流传输
      WS接口.addEventListener("error", () => {
        控制器.close();
      }); //监听客户端WS接口异常信息，结束流传输
    },
  });
  数据流.pipeTo(
    new WritableStream({
      //将客户端接收到的WS数据发往TCP接口
      async write(VL数据) {
        await 传输数据.write(VL数据);
      },
    })
  );
}
//////////////////////////////////////////////////////////////////////////SOCKS5部分//////////////////////////////////////////////////////////////////////
async function 创建SOCKS5接口(识别地址类型, 访问地址, 访问端口) {
  const { username, password, hostname, port } = await 获取SOCKS5账号(我的SOCKS5账号);
  const SOCKS5接口 = connect({ hostname, port });
  try {
    await SOCKS5接口.opened;
  } catch {
    return new Response("SOCKS5未连通", { status: 400 });
  }
  const writer = SOCKS5接口.writable.getWriter();
  const reader = SOCKS5接口.readable.getReader();
  const encoder = new TextEncoder();
  const socksGreeting = new Uint8Array([5, 2, 0, 2]); //构建认证信息,支持无认证和用户名/密码认证
  await writer.write(socksGreeting);
  let res = (await reader.read()).value;
  if (res[1] === 0x02) {
    //检查是否需要用户名/密码认证
    if (!username || !password) {
      return 关闭接口并退出();
    }
    const authRequest = new Uint8Array([1, username.length, ...encoder.encode(username), password.length, ...encoder.encode(password)]); // 发送用户名/密码认证请求
    await writer.write(authRequest);
    res = (await reader.read()).value;
    if (res[0] !== 0x01 || res[1] !== 0x00) {
      return 关闭接口并退出(); // 认证失败
    }
  }
  let 转换访问地址;
  switch (识别地址类型) {
    case 1: // IPv4
      转换访问地址 = new Uint8Array([1, ...访问地址.split(".").map(Number)]);
      break;
    case 2: // 域名
      转换访问地址 = new Uint8Array([3, 访问地址.length, ...encoder.encode(访问地址)]);
      break;
    case 3: // IPv6
      转换访问地址 = new Uint8Array([4, ...访问地址.split(":").flatMap((x) => [parseInt(x.slice(0, 2), 16), parseInt(x.slice(2), 16)])]);
      break;
    default:
      return 关闭接口并退出();
  }
  const socksRequest = new Uint8Array([5, 1, 0, ...转换访问地址, 访问端口 >> 8, 访问端口 & 0xff]); //发送转换后的访问地址/端口
  await writer.write(socksRequest);
  res = (await reader.read()).value;
  if (res[0] !== 0x05 || res[1] !== 0x00) {
    return 关闭接口并退出(); // 连接失败
  }
  writer.releaseLock();
  reader.releaseLock();
  return SOCKS5接口;
  function 关闭接口并退出() {
    writer.releaseLock();
    reader.releaseLock();
    SOCKS5接口.close();
    return new Response("SOCKS5握手失败", { status: 400 });
  }
}
async function 获取SOCKS5账号(SOCKS5) {
  const [latter, former] = SOCKS5.split("@").reverse();
  let username, password, hostname, port;
  if (former) {
    const formers = former.split(":");
    username = formers[0];
    password = formers[1];
  }
  const latters = latter.split(":");
  port = Number(latters.pop());
  hostname = latters.join(":");
  return { username, password, hostname, port };
}
//////////////////////////////////////////////////////////////////////////订阅页面////////////////////////////////////////////////////////////////////////
let 转码 = "vl",
  转码2 = "ess",
  符号 = "://",
  小猫 = "cla",
  咪 = "sh";
function 给我通用配置文件(hostName) {
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
function 给我小猫咪配置文件(hostName) {
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
    sni: ${hostName}
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
geodata-mode: true
geox-url:
  geoip: "https://cdn.jsdelivr.net/gh/Loyalsoldier/geoip@release/cn.dat"
proxies:
${节点配置}
proxy-groups:
  - name: "自动选择"
    type: fallback
    url: "https://www.google.com/generate_204"
    interval: 60
    proxies:
${代理配置}
rules:
  - GEOIP,CN,DIRECT
  - MATCH,自动选择
`;
}
