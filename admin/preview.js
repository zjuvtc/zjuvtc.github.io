/* Decap CMS preview templates — matches actual site rendering */

CMS.registerPreviewStyle('../assets/css/style.css');

var h = window.h;

/* ── News & Sponsorship detail ───────────────────────────────────────────── */
function makeDetailPreview(category) {
  return function DetailPreview(_ref) {
    var entry    = _ref.entry;
    var widgetFor = _ref.widgetFor;
    var getAsset = _ref.getAsset;
    var d = entry.get('data');
    var cover  = d.get('cover');
    var title  = d.get('title')  || '';
    var date   = d.get('date')   || '';
    var author = d.get('author') || '';
    var tags   = d.get('tags');
    var coverUrl = cover ? getAsset(cover).toString() : null;

    return h('div', {},
      h('header', { className: 'detail-header' },
        h('div', { className: 'detail-header-inner' },
          h('span', { className: 'detail-category' }, category),
          h('h1',   { className: 'detail-title'    }, title),
          h('div',  { className: 'detail-meta'     },
            date   && h('span', {}, date),
            author && h('span', {}, author),
            tags && tags.map && tags.map(function(t) {
              return h('span', { key: t }, '#' + t);
            })
          )
        )
      ),
      coverUrl
        ? h('div', { className: 'detail-cover' }, h('img', { src: coverUrl, alt: title }))
        : null,
      h('div', { className: 'post-content post-body' }, widgetFor('body'))
    );
  };
}

/* ── Team member ─────────────────────────────────────────────────────────── */
function MemberPreview(_ref) {
  var entry    = _ref.entry;
  var widgetFor = _ref.widgetFor;
  var getAsset = _ref.getAsset;
  var d = entry.get('data');
  var photo           = d.get('photo');
  var name            = d.get('name')             || '';
  var role            = d.get('role')             || '';
  var batch           = d.get('batch')            || '';
  var serviceLocation = d.get('service_location') || '';
  var school          = d.get('school')           || '';
  var photoUrl = photo ? getAsset(photo).toString() : null;

  var photoEl = photoUrl
    ? h('img', { src: photoUrl, alt: name })
    : h('div', { style: { fontSize: '4rem', textAlign: 'center', padding: '24px 0', background: '#f6f6f4' } }, '👤');

  return h('div', { className: 'member-detail-wrap', style: { padding: '40px 32px' } },
    h('div', { className: 'member-sidebar', style: { position: 'static' } },
      h('div', { className: 'member-photo-lg' }, photoEl),
      h('div', { className: 'member-sidebar-name' }, name),
      h('div', { className: 'member-sidebar-role' },
        role + (batch ? ' · ' + batch : '')
      ),
      serviceLocation && h('div', { className: 'member-sidebar-location' }, serviceLocation),
      school && h('span', { className: 'member-sidebar-school' }, '🏫 ' + school)
    ),
    h('div', { className: 'post-body' }, widgetFor('body'))
  );
}

/* ── Activity detail ─────────────────────────────────────────────────────── */
function ActivityPreview(_ref) {
  var entry    = _ref.entry;
  var widgetFor = _ref.widgetFor;
  var getAsset = _ref.getAsset;
  var d = entry.get('data');
  var cover  = d.get('cover');
  var title  = d.get('title') || '';
  var year   = d.get('year')  || '';
  var active = d.get('active');
  var coverUrl = cover ? getAsset(cover).toString() : null;

  return h('div', {},
    h('header', { className: 'detail-header' },
      h('div', { className: 'detail-header-inner' },
        h('span', { className: 'detail-category' }, '品牌活动'),
        h('h1',   { className: 'detail-title'    }, title),
        h('div',  { className: 'detail-meta'     },
          year   && h('span', {}, year + ' 年'),
          active && h('span', {}, '进行中')
        )
      )
    ),
    coverUrl
      ? h('div', { className: 'detail-cover' }, h('img', { src: coverUrl, alt: title }))
      : null,
    h('div', { className: 'post-content post-body' }, widgetFor('body'))
  );
}

/* ── Register preview templates ──────────────────────────────────────────── */
CMS.registerPreviewTemplate('news',        makeDetailPreview('新闻动态'));
CMS.registerPreviewTemplate('sponsorship', makeDetailPreview('赞助公示'));
CMS.registerPreviewTemplate('team',        MemberPreview);
CMS.registerPreviewTemplate('activities',  ActivityPreview);

/* ── Text alignment editor components ───────────────────────────────────── */
var alignConfigs = [
  { id: 'align-left',   label: '⬅ 左对齐', align: 'left'   },
  { id: 'align-center', label: '↔ 居中',   align: 'center' },
  { id: 'align-right',  label: '➡ 右对齐', align: 'right'  },
];

alignConfigs.forEach(function(cfg) {
  CMS.registerEditorComponent({
    id:     cfg.id,
    label:  cfg.label,
    fields: [{ name: 'content', label: '文字内容', widget: 'text' }],
    pattern: new RegExp(
      '^<p style="text-align:' + cfg.align + '">((?:.|\\n)*?)<\\/p>$'
    ),
    fromBlock: function(match) {
      return { content: match[1].replace(/<br>/g, '\n') };
    },
    toBlock: function(obj) {
      var content = (obj.content || '').replace(/\n/g, '<br>');
      return '<p style="text-align:' + cfg.align + '">' + content + '</p>';
    },
    toPreview: function(obj) {
      var content = (obj.content || '').replace(/\n/g, '<br>');
      return '<p style="text-align:' + cfg.align + '">' + content + '</p>';
    },
  });
});
