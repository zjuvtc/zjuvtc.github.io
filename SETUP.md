# 部署说明

## 一、首次部署网站

```bash
# 1. 在 GitHub 新建仓库，命名为 your-username.github.io 或任意名称
git remote add origin https://github.com/zjuvtc/zjuvtc.github.io.git
git push -u origin main --force

# 2. GitHub → Settings → Pages → Source → GitHub Actions
```

## 二、配置可视化后台（一次性，约10分钟）

后台地址将是：`https://your-site.github.io/admin/`

### 步骤 1：创建 GitHub OAuth App

1. 打开 https://github.com/settings/developers → **New OAuth App**
2. 填写：
   - Application name: `浙大支教团 CMS`
   - Homepage URL: `https://YOUR_USERNAME.github.io`
   - Authorization callback URL: `https://jiaotuan-oauth.YOUR_SUBDOMAIN.workers.dev/callback`
3. 点击 Create，记下 **Client ID** 和 **Client Secret**

### 步骤 2：部署 OAuth 代理到 Cloudflare Workers（免费）

```bash
npm install -g wrangler
wrangler login
wrangler deploy files/oauth-worker.js --name jiaotuan-oauth

# 设置密钥（输入上面记下的值）
wrangler secret put GITHUB_CLIENT_ID
wrangler secret put GITHUB_CLIENT_SECRET
```

部署成功后，Worker URL 格式为：
`https://jiaotuan-oauth.<your-subdomain>.workers.dev`

### 步骤 3：填写 admin/config.yml

打开 `admin/config.yml`，替换：
```yaml
repo: YOUR_GITHUB_USERNAME/YOUR_REPO_NAME
base_url: https://jiaotuan-oauth.your-subdomain.workers.dev
```

然后推送：
```bash
./update.sh "Configure CMS"
```

### 步骤 4：添加后续成员为协作者

GitHub → 仓库 Settings → Collaborators → 添加新成员的 GitHub 账号

之后他们访问 `https://your-site.github.io/admin/`，用 GitHub 账号登录即可编辑内容。

---

## 三、日常更新内容（技术成员）

```bash
./update.sh "更新新闻"
```

---

## 四、后续成员使用后台（无需技术背景）

1. 打开浏览器，访问 `https://your-site.github.io/admin/`
2. 点击 **Login with GitHub**
3. 选择要编辑的栏目（新闻动态 / 团队成员 / 品牌活动 / 赞助公示）
4. 新建或编辑内容，上传图片，点击 **Publish**
5. 等待约 2 分钟，网站自动更新

**无需安装任何软件，无需命令行，全程在浏览器中完成。**
