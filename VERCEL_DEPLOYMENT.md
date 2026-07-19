# Vercel 海外部署指南

## 问题说明

在Vercel海外服务器上部署时，网易云音乐API会因为地域限制导致音乐无法播放。

## 解决方案

### 1. 使用 realIP 参数绕过地域检测

在所有调用 `song_url_v1` 的地方添加 `realIP` 参数，伪装成国内IP：

```typescript
const urlRes = await song_url_v1({
  id: songId,
  level: 'standard',
  cookie,
  realIP: '116.25.146.177' // 使用国内IP地址
});
```

### 2. 已修改的文件

- ✅ `lib/netease-config.ts` - 新增统一配置文件
- ✅ `lib/bgm.ts` - 添加 realIP 参数（2处）
- ✅ `app/api/song-url/route.ts` - 添加 realIP 参数
- ✅ `app/api/playlist-tracks/route.ts` - 添加 realIP 参数
- ✅ `app/api/playlists/route.ts` - 使用统一配置

### 3. Vercel 环境变量配置

在 Vercel 项目设置中添加以下环境变量：

```
NETEASE_PHONE=你的网易云手机号
NETEASE_PASSWORD=你的网易云密码
DEEPSEEK_API_KEY=你的DeepSeek API Key
ZHIPU_API_KEY=你的智谱AI API Key
QWEATHER_API_KEY=你的和风天气API Key
QWEATHER_API_HOST=https://nm63yxugm6.re.qweatherapi.com
```

### 4. 备用方案

如果 realIP 方案失效，可以考虑以下备选：

#### 方案A：使用反向代理
在国内服务器搭建代理，Vercel通过代理访问网易云API。

#### 方案B：使用其他音乐源
`@neteasecloudmusicapienhanced/api` 包已包含 `unblockmusic-utils`，支持从以下备用源获取音乐：
- 酷我音乐 (kuwo)
- 咪咕音乐 (migu)
- 酷狗音乐 (kugou)
- YouTube Music (youtube)

配置方式已在 `lib/netease-config.ts` 中预留接口。

### 5. 测试步骤

1. 本地测试：
```bash
npm run build
npm run start
```

2. 访问应用，选择城市和状态，生成音乐
3. 检查音乐是否能正常播放
4. 检查浏览器控制台是否有错误

### 6. 部署到 Vercel

```bash
# 提交更改
git add .
git commit -m "fix: add realIP parameter for overseas music playback"
git push origin main
```

Vercel会自动检测到推送并重新部署。

### 7. 验证部署

部署完成后访问：`https://moodvibe-three.vercel.app`

测试流程：
1. 选择城市（如"北京"）
2. 选择状态（如"美滋滋"）
3. 点击生成
4. 检查音乐是否能播放

### 8. 监控和日志

在 Vercel Dashboard 中查看：
- **Functions** - 查看API调用日志
- **Analytics** - 监控性能指标
- **Logs** - 查看错误日志

常见错误：
- `url: null` - Cookie失效或IP被封
- `401 Unauthorized` - 账号密码错误
- `403 Forbidden` - 地域限制未解除

## 技术细节

### realIP 参数原理

网易云音乐API会检查请求来源IP，通过在请求中添加 `realIP` 参数，可以让服务器认为请求来自国内，从而绕过地域限制。

### Cookie 管理

- Cookie会自动从环境变量 `NETEASE_PHONE` 和 `NETEASE_PASSWORD` 生成
- Cookie有效期约为1-2个月
- 失效后需要在Vercel重新登录生成

## 注意事项

⚠️ **重要**：
1. 不要将 `.env.local` 文件提交到Git仓库
2. 确保 `.gitignore` 包含 `.env.local` 和 `.netease_cookie`
3. 在Vercel中配置环境变量，不要硬编码敏感信息
4. 定期检查Cookie是否过期

## 问题排查

如果音乐仍无法播放：

1. 检查Vercel环境变量是否正确配置
2. 查看Function日志，确认API调用是否成功
3. 尝试使用不同的 realIP 地址
4. 考虑启用备用音乐源
