import { connect } from 'cloudflare:sockets';

export default {
	async fetch(访问请求) {
		const 读取我的请求标头 = 访问请求.headers.get('Upgrade');
		const url = new URL(访问请求.url);
		if (读取我的请求标头 === 'websocket') {
			const 反代IP = url.searchParams.get('ip') || '';
			return 升级WS请求(反代IP);
		}
		return new Response('Not found', { status: 404 });
	},
};

function 升级WS请求(反代IP) {
	const [客户端, WS接口] = Object.values(new WebSocketPair());
	WS接口.accept();
	WS接口.binaryType = 'arraybuffer';
	WS接口.send(new Uint8Array([0, 0]));
	启动传输管道(WS接口, 反代IP);
	return new Response(null, { status: 101, webSocket: 客户端 });
}

async function 启动传输管道(WS接口, 反代IP) {
	let TCP接口 = null;
	let 已建立连接 = false;
	let TCP写入器 = null;

	WS接口.addEventListener('message', async (event) => {
		try {
			if (!已建立连接) {
				const 结果 = await 解析VL标头(event.data, 反代IP);
				if (!结果) {
					WS接口.close(1008, 'Protocol error');
					return;
				}
				TCP接口 = 结果.TCP接口;
				已建立连接 = true;

				TCP写入器 = TCP接口.writable.getWriter();

				if (结果.写入初始数据?.byteLength > 0) {
					await TCP写入器.write(结果.写入初始数据);
				}

				TCP接口.readable
					.pipeTo(
						new WritableStream({
							write(chunk) {
								WS接口.send(chunk);
							},
						}),
					)
					.catch(() => {});
			} else if (TCP写入器) {
				await TCP写入器.write(event.data);
			}
		} catch {
			WS接口.close(1011, 'Connection error');
		}
	});
}

function 解析VL标头(VL数据, 反代IP) {
	const 数据 = new Uint8Array(VL数据);
	const 获取数据定位 = 数据[17];
	const 提取端口索引 = 18 + 获取数据定位 + 1;
	const 建立端口缓存 = VL数据.slice(提取端口索引, 提取端口索引 + 2);
	const 访问端口 = new DataView(建立端口缓存).getUint16(0);
	const 提取地址索引 = 提取端口索引 + 2;
	const 识别地址类型 = 数据[提取地址索引];
	let 地址长度 = 0;
	let 访问地址 = '';
	let 地址信息索引 = 提取地址索引 + 1;

	switch (识别地址类型) {
		case 1:
			地址长度 = 4;
			访问地址 = 数据.slice(地址信息索引, 地址信息索引 + 地址长度).join('.');
			break;
		case 2: {
			地址长度 = 数据[地址信息索引];
			地址信息索引 += 1;
			访问地址 = new TextDecoder().decode(VL数据.slice(地址信息索引, 地址信息索引 + 地址长度));
			break;
		}
		case 3:
			地址长度 = 16;
			const ipv6 = [];
			for (let i = 0; i < 8; i++) {
				ipv6.push(new DataView(VL数据.slice(地址信息索引, 地址信息索引 + 地址长度)).getUint16(i * 2).toString(16));
			}
			访问地址 = ipv6.join(':');
			break;
		default:
			return null;
	}

	const 写入初始数据 = VL数据.slice(地址信息索引 + 地址长度);
	const TCP连接参数 = { hostname: 访问地址, port: 访问端口 };

	return 尝试连接TCP(TCP连接参数, 反代IP, 访问端口, 写入初始数据);
}

async function 尝试连接TCP(参数, 反代IP, 默认端口, 写入初始数据) {
	try {
		const TCP接口 = connect(参数);
		await TCP接口.opened;
		return { TCP接口, 写入初始数据 };
	} catch {
		if (!反代IP) throw new Error('Direct connection failed and no proxy IP provided');
		const [反代IP地址, 反代端口字符串] = 反代IP.split(':');
		const 反代端口 = 反代端口字符串 ? Number(反代端口字符串) : 默认端口;
		const TCP接口 = connect({ hostname: 反代IP地址, port: 反代端口 });
		await TCP接口.opened;
		return { TCP接口, 写入初始数据 };
	}
}
