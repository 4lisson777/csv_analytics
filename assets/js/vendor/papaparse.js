/* PapaParse-compatible CSV parser/unparser (local vendor copy) */
/* Implements the subset of the PapaParse 5 API used by this project */
(function (global) {
  'use strict';

  var Papa = {};

  /* ── parse ──────────────────────────────────────────────────────── */
  Papa.parse = function (input, config) {
    config = config || {};
    if (input instanceof File || input instanceof Blob) {
      var reader = new FileReader();
      reader.onload = function (e) {
        try {
          var result = parseText(e.target.result, config);
          if (config.complete) config.complete(result);
        } catch (err) {
          if (config.error) config.error(err);
        }
      };
      reader.onerror = function () {
        if (config.error) config.error(new Error('FileReader error'));
      };
      reader.readAsText(input);
    } else {
      try {
        var result = parseText(input, config);
        if (config.complete) config.complete(result);
      } catch (err) {
        if (config.error) config.error(err);
      }
    }
  };

  function parseText(text, config) {
    var useHeader       = config.header !== false;
    var skipEmptyLines  = !!config.skipEmptyLines;
    var delimiter       = config.delimiter || ',';

    /* normalise line endings */
    var lines = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');

    var fields   = [];
    var data     = [];
    var startIdx = 0;

    if (useHeader && lines.length > 0) {
      fields   = tokenise(lines[0], delimiter);
      startIdx = 1;
    }

    for (var i = startIdx; i < lines.length; i++) {
      var line = lines[i];
      if (skipEmptyLines && !line.trim()) continue;

      var values = tokenise(line, delimiter);

      if (useHeader) {
        var row = {};
        for (var j = 0; j < fields.length; j++) {
          row[fields[j]] = j < values.length ? values[j] : '';
        }
        data.push(row);
      } else {
        data.push(values);
      }
    }

    return {
      data: data,
      errors: [],
      meta: { fields: useHeader ? fields.slice() : null },
    };
  }

  /* RFC-4180-compatible tokeniser */
  function tokenise(line, delimiter) {
    var tokens  = [];
    var current = '';
    var inQ     = false;

    for (var i = 0; i < line.length; i++) {
      var ch = line[i];
      if (inQ) {
        if (ch === '"') {
          if (line[i + 1] === '"') { current += '"'; i++; }
          else                     { inQ = false; }
        } else {
          current += ch;
        }
      } else {
        if      (ch === '"')      { inQ = true; }
        else if (ch === delimiter){ tokens.push(current); current = ''; }
        else                      { current += ch; }
      }
    }
    tokens.push(current);
    return tokens;
  }

  /* ── unparse ────────────────────────────────────────────────────── */
  Papa.unparse = function (data /*, config */) {
    if (!data || !data.length) return '';

    var fields = Object.keys(data[0]);
    var rows   = [fields.map(quote).join(',')];

    for (var i = 0; i < data.length; i++) {
      var row = data[i];
      rows.push(fields.map(function (f) {
        return quote(row[f] !== undefined ? row[f] : '');
      }).join(','));
    }

    return rows.join('\r\n');
  };

  function quote(value) {
    var s = String(value);
    if (s.indexOf(',') !== -1 || s.indexOf('"') !== -1 || s.indexOf('\n') !== -1) {
      return '"' + s.replace(/"/g, '""') + '"';
    }
    return s;
  }

  global.Papa = Papa;

}(typeof window !== 'undefined' ? window : this));
