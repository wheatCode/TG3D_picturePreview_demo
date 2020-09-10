// import i18n from '../i18n/i18n';

export const DateTimeFormatter = new Intl.DateTimeFormat('en-US', {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

export const wait = sec =>
  new Promise(resolve => {
    setTimeout(resolve, sec * 1000);
  });

export function ChangesMonitor(e) {
  const def = {
    on_change_start: function() {},
    on_change_stop: function() {},
    timeout: 1000, // ms
  };

  this.init = e => {
    this._handle = -1;
    this._on_change_start = e.on_change_start || def.on_change_start;
    this._on_change_stop = e.on_change_stop || def.on_change_stop;
    this._timeout = e.timeout || def.timeout;
    this._num_of_retry = this._timeout / 100;
    this._retry = -1;
  };
  this.change = () => {
    // reset retry count
    this._retry = this._num_of_retry;

    if (this._handle === -1) {
      this._on_change_start.call(this);

      this._handle = setInterval(() => {
        if (this._retry <= 0) {
          clearInterval(this._handle);
          this._handle = -1;
          this._retry = -1;
          this._on_change_stop.call(this);
          return;
        }

        this._retry--;
      }, 100);
    }
  };
  this.cancel = () => {
    if (this._handle !== -1) {
      clearInterval(this._handle);
      this._handle = -1;
      this._retry = -1;
    }
  };

  this.init(e);
}

export const loadImage = url =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      resolve(img);
    };
    img.onerror = reject;
    img.src = url;
  });

export const getCanvas = (width, height) => {
  const canvas = document.createElement('canvas');
  if (width >= 0) {
    canvas.setAttribute('width', `${width}px`);
  }
  if (height >= 0) {
    canvas.setAttribute('height', `${height}px`);
  }
  return canvas;
};

export const generate_tiled_image = img => {
  const image_width = img.naturalWidth;
  const image_height = img.naturalHeight;
  const max_edge = Math.max(image_width, image_height, 90);
  const rect_size = max_edge * 3;
  const canvas = getCanvas(rect_size, rect_size);
  const ctx = canvas.getContext('2d');
  const pattern = ctx.createPattern(img, 'repeat');

  ctx.imageSmoothingQuality = 'high';
  ctx.rect(0, 0, rect_size, rect_size);
  ctx.fillStyle = pattern;
  ctx.fill();

  return loadImage(canvas.toDataURL('image/png', 1.0));
};

export const generate_thumbnail_from_repeatable_color_image = (img, thumbnail_size) =>
  generate_tiled_image(img)
    .then(tiled_image => {
      const image_width = tiled_image.naturalWidth;
      const image_height = tiled_image.naturalHeight;
      const rect_size = Math.max(image_width, image_height);
      const x1 = Math.round(rect_size / 6);
      const y1 = Math.round(rect_size / 6);
      const x2 = x1 + Math.round(rect_size / 2);
      const y2 = y1 + Math.round(rect_size / 2);

      const canvas = getCanvas(thumbnail_size, thumbnail_size);
      const ctx = canvas.getContext('2d');
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(tiled_image, x1, y1, x2, y2, 0, 0, thumbnail_size, thumbnail_size);
      return loadImage(canvas.toDataURL('image/png', 1.0));
    })
    .then(img => img);

export const clip_fabric_edge = (img, num_of_corners) => {
  const image_width = img.naturalWidth;
  const image_height = img.naturalHeight;
  const rect_size = Math.max(image_width, image_height);
  const canvas = getCanvas(rect_size, rect_size);
  const ctx = canvas.getContext('2d');
  const _n = (num_of_corners + 1) * 2;
  const _r = rect_size / _n;
  ctx.beginPath();
  ctx.moveTo(_r, _r);
  for (let i = 2; i < _n; i++) {
    ctx.lineTo(_r * i, _r * (i % 2));
  }
  for (let i = 2; i < _n; i++) {
    ctx.lineTo(_r * (_n - (i % 2)), _r * i);
  }
  for (let i = 2; i < _n; i++) {
    ctx.lineTo(_r * (_n - i), _r * (_n - (i % 2)));
  }
  for (let i = 2; i < _n; i++) {
    ctx.lineTo(_r * (i % 2), _r * (_n - i));
  }

  ctx.clip();
  ctx.drawImage(img, 0, 0, rect_size, rect_size, 0, 0, rect_size, rect_size);
  return canvas.toDataURL('image/png', 1.0);
};

export const scale_image = (img, scale_rate) => {
  const image_width = img.naturalWidth;
  const image_height = img.naturalHeight;
  const target_width = Math.round(img.naturalWidth * scale_rate);
  const target_height = Math.round(img.naturalHeight * scale_rate);
  const canvas = getCanvas(target_width, target_height);
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, 0, 0, image_width, image_height, 0, 0, target_width, target_height);
  return canvas.toDataURL('image/png', 1.0);
};

/* eslint-disable */
function rewrite_pHYs_chunk(data, ppmx, ppmy) {
  /* crc32.js (C) 2014-present SheetJS -- http://sheetjs.com */
  /* vim: set ts=2: */
  /*exported CRC32 */
  var CRC32;
  (function (factory) {
    /*jshint ignore:start */
    if (typeof DO_NOT_EXPORT_CRC === 'undefined') {
      if ('object' === typeof exports) {
        factory(exports);
      } else if ('function' === typeof define && define.amd) {
        define(function () {
          var module = {};
          factory(module);
          return module;
        });
      } else {
        factory((CRC32 = {}));
      }
    } else {
      factory((CRC32 = {}));
    }
    /*jshint ignore:end */
  })(function (CRC32) {
    CRC32.version = '1.1.1';
    /* see perf/crc32table.js */
    /*global Int32Array */
    function signed_crc_table() {
      var c = 0,
        table = new Array(256);

      for (var n = 0; n != 256; ++n) {
        c = n;
        c = c & 1 ? -306674912 ^ (c >>> 1) : c >>> 1;
        c = c & 1 ? -306674912 ^ (c >>> 1) : c >>> 1;
        c = c & 1 ? -306674912 ^ (c >>> 1) : c >>> 1;
        c = c & 1 ? -306674912 ^ (c >>> 1) : c >>> 1;
        c = c & 1 ? -306674912 ^ (c >>> 1) : c >>> 1;
        c = c & 1 ? -306674912 ^ (c >>> 1) : c >>> 1;
        c = c & 1 ? -306674912 ^ (c >>> 1) : c >>> 1;
        c = c & 1 ? -306674912 ^ (c >>> 1) : c >>> 1;
        table[n] = c;
      }

      return typeof Int32Array !== 'undefined' ? new Int32Array(table) : table;
    }

    var T = signed_crc_table();

    function crc32_bstr(bstr, seed) {
      var C = seed ^ -1,
        L = bstr.length - 1;
      for (var i = 0; i < L;) {
        C = (C >>> 8) ^ T[(C ^ bstr.charCodeAt(i++)) & 0xff];
        C = (C >>> 8) ^ T[(C ^ bstr.charCodeAt(i++)) & 0xff];
      }
      if (i === L) C = (C >>> 8) ^ T[(C ^ bstr.charCodeAt(i)) & 0xff];
      return C ^ -1;
    }

    function crc32_buf(buf, seed) {
      if (buf.length > 10000) return crc32_buf_8(buf, seed);
      var C = seed ^ -1,
        L = buf.length - 3;
      for (var i = 0; i < L;) {
        C = (C >>> 8) ^ T[(C ^ buf[i++]) & 0xff];
        C = (C >>> 8) ^ T[(C ^ buf[i++]) & 0xff];
        C = (C >>> 8) ^ T[(C ^ buf[i++]) & 0xff];
        C = (C >>> 8) ^ T[(C ^ buf[i++]) & 0xff];
      }
      while (i < L + 3) C = (C >>> 8) ^ T[(C ^ buf[i++]) & 0xff];
      return C ^ -1;
    }

    function crc32_buf_8(buf, seed) {
      var C = seed ^ -1,
        L = buf.length - 7;
      for (var i = 0; i < L;) {
        C = (C >>> 8) ^ T[(C ^ buf[i++]) & 0xff];
        C = (C >>> 8) ^ T[(C ^ buf[i++]) & 0xff];
        C = (C >>> 8) ^ T[(C ^ buf[i++]) & 0xff];
        C = (C >>> 8) ^ T[(C ^ buf[i++]) & 0xff];
        C = (C >>> 8) ^ T[(C ^ buf[i++]) & 0xff];
        C = (C >>> 8) ^ T[(C ^ buf[i++]) & 0xff];
        C = (C >>> 8) ^ T[(C ^ buf[i++]) & 0xff];
        C = (C >>> 8) ^ T[(C ^ buf[i++]) & 0xff];
      }
      while (i < L + 7) {
        C = (C >>> 8) ^ T[(C ^ buf[i++]) & 0xff];
      }
      return C ^ -1;
    }

    function crc32_str(str, seed) {
      var C = seed ^ -1;
      for (var i = 0, L = str.length, c, d; i < L;) {
        c = str.charCodeAt(i++);
        if (c < 0x80) {
          C = (C >>> 8) ^ T[(C ^ c) & 0xff];
        } else if (c < 0x800) {
          C = (C >>> 8) ^ T[(C ^ (192 | ((c >> 6) & 31))) & 0xff];
          C = (C >>> 8) ^ T[(C ^ (128 | (c & 63))) & 0xff];
        } else if (c >= 0xd800 && c < 0xe000) {
          c = (c & 1023) + 64;
          d = str.charCodeAt(i++) & 1023;
          C = (C >>> 8) ^ T[(C ^ (240 | ((c >> 8) & 7))) & 0xff];
          C = (C >>> 8) ^ T[(C ^ (128 | ((c >> 2) & 63))) & 0xff];
          C =
            (C >>> 8) ^
            T[(C ^ (128 | ((d >> 6) & 15) | ((c & 3) << 4))) & 0xff];
          C = (C >>> 8) ^ T[(C ^ (128 | (d & 63))) & 0xff];
        } else {
          C = (C >>> 8) ^ T[(C ^ (224 | ((c >> 12) & 15))) & 0xff];
          C = (C >>> 8) ^ T[(C ^ (128 | ((c >> 6) & 63))) & 0xff];
          C = (C >>> 8) ^ T[(C ^ (128 | (c & 63))) & 0xff];
        }
      }
      return C ^ -1;
    }
    CRC32.table = T;
    CRC32.bstr = crc32_bstr;
    CRC32.buf = crc32_buf;
    CRC32.str = crc32_str;
  });

  // Used for fast-ish conversion between uint8s and uint32s/int32s.
  // Also required in order to remain agnostic for both Node Buffers and
  // Uint8Arrays.
  var uint8 = new Uint8Array(4);
  var int32 = new Int32Array(uint8.buffer);
  var uint32 = new Uint32Array(uint8.buffer);

  var pHYsFound = false;

  if (
    data[0] !== 0x89 ||
    data[1] !== 0x50 ||
    data[2] !== 0x4e ||
    data[3] !== 0x47 ||
    data[4] !== 0x0d ||
    data[5] !== 0x0a ||
    data[6] !== 0x1a ||
    data[7] !== 0x0a
  ) {
    console.warn('corrupted data', data);
    console.warn('typeof data', typeof data);
    throw new Error(
      'Invalid .png file header: possibly caused by DOS-Unix line ending conversion?'
    );
  }

  var ended = false;
  var idx = 8;

  while (idx < data.length) {
    // Read the length of the current chunk,
    // which is stored as a Uint32.
    uint8[3] = data[idx++];
    uint8[2] = data[idx++];
    uint8[1] = data[idx++];
    uint8[0] = data[idx++];

    // Chunk includes name/type for CRC check (see below).
    var length = uint32[0] + 4;
    var chunk = new Uint8Array(length);
    chunk[0] = data[idx++];
    chunk[1] = data[idx++];
    chunk[2] = data[idx++];
    chunk[3] = data[idx++];

    // Get the name in ASCII for identification.
    var name =
      String.fromCharCode(chunk[0]) +
      String.fromCharCode(chunk[1]) +
      String.fromCharCode(chunk[2]) +
      String.fromCharCode(chunk[3]);

    console.log('chunk found ' + name + ', length = ' + (length - 4));

    var chunkDataStart = idx;

    // Read the contents of the chunk out of the main buffer.
    for (var i = 4; i < length; i++) {
      chunk[i] = data[idx++];
    }

    var crcStart = idx;
    // Read out the CRC value for comparison.
    // It's stored as an Int32.
    uint8[3] = data[idx++];
    uint8[2] = data[idx++];
    uint8[1] = data[idx++];
    uint8[0] = data[idx++];

    var crcActual = int32[0];
    var crcExpect = CRC32.buf(chunk);
    if (crcExpect !== crcActual) {
      throw new Error(
        'CRC values for ' +
        name +
        ' header do not match, PNG file is likely corrupted'
      );
    } else {
      console.log(
        'CRCs match! ' + crcExpect + ' ' + crcActual + ' ' + chunk.length
      );
    }

    if (name == 'IDAT') {
      chunkDataStart = chunkDataStart - 8;

      var len = data.length;

      // create new array with pHYs chunk inserted
      // 4+4+13
      var data2 = new Uint8Array(len + 21);

      // copy before IEND
      for (var i = 0; i < chunkDataStart; i++) {
        data2[i] = data[i];
      }
      // copy IEND to end
      for (var i = chunkDataStart; i < len; i++) {
        data2[i + 21] = data[i];
      }

      var phys = new Uint8Array(13);
      var i = 0;

      // length of pHYs chunk
      int32[0] = 9;
      data2[chunkDataStart++] = uint8[3];
      data2[chunkDataStart++] = uint8[2];
      data2[chunkDataStart++] = uint8[1];
      data2[chunkDataStart++] = uint8[0];

      // pHYs (chunk name)
      phys[i++] = data2[chunkDataStart++] = 'p'.charCodeAt(0);
      phys[i++] = data2[chunkDataStart++] = 'H'.charCodeAt(0);
      phys[i++] = data2[chunkDataStart++] = 'Y'.charCodeAt(0);
      phys[i++] = data2[chunkDataStart++] = 's'.charCodeAt(0);

      // x
      uint32[0] = ppmx;
      phys[i++] = data2[chunkDataStart++] = uint8[3];
      phys[i++] = data2[chunkDataStart++] = uint8[2];
      phys[i++] = data2[chunkDataStart++] = uint8[1];
      phys[i++] = data2[chunkDataStart++] = uint8[0];
      // y
      uint32[0] = ppmy;
      phys[i++] = data2[chunkDataStart++] = uint8[3];
      phys[i++] = data2[chunkDataStart++] = uint8[2];
      phys[i++] = data2[chunkDataStart++] = uint8[1];
      phys[i++] = data2[chunkDataStart++] = uint8[0];
      // unit = meters
      phys[i++] = data2[chunkDataStart++] = 1;

      var physCRC = CRC32.buf(phys);
      int32[0] = physCRC;

      data2[chunkDataStart++] = uint8[3];
      data2[chunkDataStart++] = uint8[2];
      data2[chunkDataStart++] = uint8[1];
      data2[chunkDataStart++] = uint8[0];

      return data2;
    }

    if (name == 'pHYs') {
      console.log('pHYs chunk found, rewriting!!!!!!!!!!!!!');

      var phys = new Uint8Array(13);
      var i = 0;

      // pHYs (chunk name)
      phys[i++] = 'p'.charCodeAt(0);
      phys[i++] = 'H'.charCodeAt(0);
      phys[i++] = 'Y'.charCodeAt(0);
      phys[i++] = 's'.charCodeAt(0);
      // x
      uint32[0] = ppmx;
      phys[i++] = data[chunkDataStart++] = uint8[3];
      phys[i++] = data[chunkDataStart++] = uint8[2];
      phys[i++] = data[chunkDataStart++] = uint8[1];
      phys[i++] = data[chunkDataStart++] = uint8[0];
      // y
      uint32[0] = ppmy;
      phys[i++] = data[chunkDataStart++] = uint8[3];
      phys[i++] = data[chunkDataStart++] = uint8[2];
      phys[i++] = data[chunkDataStart++] = uint8[1];
      phys[i++] = data[chunkDataStart++] = uint8[0];
      // unit = meters
      phys[i++] = data[chunkDataStart++] = 1;

      var physCRC = CRC32.buf(phys);
      int32[0] = physCRC;

      data[crcStart++] = uint8[3];
      data[crcStart++] = uint8[2];
      data[crcStart++] = uint8[1];
      data[crcStart++] = uint8[0];

      return data;
    }
  }

  throw new Error(
    '.png file ended prematurely: no IEND or pHYs header was found'
  );
}
/* eslint-disable */

export const update_png_dpi = (data_url, dpi) => {
  try {
    const ppm = dpi > 0 ? Math.round((dpi / 2.54) * 100) : 72;

    const png_head = data_url.substring(0, data_url.indexOf(','));
    const bytes_string = atob(data_url.substring(data_url.indexOf(',') + 1));
    let bytes = new Uint8Array(bytes_string.length);
    for (let i = 0; i < bytes_string.length; i++) {
      bytes[i] = bytes_string.charCodeAt(i);
    }
    console.log('type of bytes:', typeof bytes);
    bytes = rewrite_pHYs_chunk(bytes, ppm, ppm);

    const buffer_size = 1024;
    let char_codes = '';
    let buffer;
    for (let i = 0; i < Math.ceil(bytes.length / buffer_size); i++) {
      buffer = bytes.slice(
        i * buffer_size,
        Math.min((i + 1) * buffer_size, bytes.length)
      );
      char_codes += String.fromCharCode.apply(this, buffer);
    }
    return png_head + ',' + btoa(char_codes);
  } catch (e) {
    console.error(e);
  }
  // to prevent the whole function not works, return original data-url if got error.
  // TODO: handle the error case (like popup some error message)
  return data_url;
};

export const base64_to_blob = data_url => {
  const bytes_string = atob(data_url.substring(data_url.indexOf(',') + 1));
  const mime_type = data_url
    .substring(0, data_url.indexOf(','))
    .split(':')[1]
    .split(';')[0];
  const content = [];
  for (let i = 0; i < bytes_string.length; i++) {
    content[i] = bytes_string.charCodeAt(i);
  }
  return new Blob([new Uint8Array(content)], {
    type: mime_type
  });
};

export const to_data_url = (image, output_type) => {
  const _w = image.naturalWidth;
  const _h = image.naturalHeight;
  const canvas = getCanvas(_w, _h);
  const ctx = canvas.getContext('2d');
  ctx.drawImage(
    image,
    0,
    0,
    image.naturalWidth,
    image.naturalHeight,
    0,
    0,
    _w,
    _h
  );
  return canvas.toDataURL(output_type);
};

export const isValidExcel = file =>
  file && typeof file.name === 'string' && file.name.indexOf('.xlsx') > 0;

export const getMD5FromBlob = blob => {
  if (!blob) {
    return Promise.resolve('');
  }
  return new Promise(resolve => {
    const reader = new FileReader();
    reader.onloadend = function () {
      resolve(md5(reader.result));
    };
    reader.readAsText(blob);
  });
};

export const base64ToBlob = async (url) => {
  const response = await fetch(url);
  return await response.blob();
};

export const LICENSE_MAP = {
  0: 'BASIC_BODY',
  1: 'BASIC_FOOT',
  10: 'STYLEBOOK_MTM',
  11: 'STYLEBOOK_CS',
  20: 'NUNO_MTM',
  100: 'DCS_LICENSE',
  9000: 'ACCOUNT_MGNT',
};