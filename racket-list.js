// =====================================================================
// PadPal · 🏸 the racket list (100 rackets, 2025–2027)
// Shapes and colours were noted by looking at each racket's shop picture (October 2026).
// Our own simple doodles: no logos or photos are copied, only shape + colours + a pattern.
//
// One line per racket: [brand, model, year, shape, face, band, bottom, pattern, accent]
//   shape: round | tear | diamond   ·   pattern: diag band chev ring wave split x stripes peak star w
//   face = main colour, band = stripe / logo-shape colour, bottom = colour at the bottom (or null)
// To add a racket later: add a line, keep the brands together.
// =====================================================================
(function () {
  var L = [
    // ----- Bullpadel -----
    ['Bullpadel', 'Vertex 05 Geo', 2027, 'diamond', '#F3D251', '#2B2B2B', '#FA913A', 'diag'],
    ['Bullpadel', 'Vertex 05 Hybrid', 2027, 'tear', '#E5E5E6', '#525153', null, 'diag'],
    ['Bullpadel', 'Hack 05 Hybrid', 2027, 'tear', '#3A3A3B', '#B2B0B0', null, 'diag'],
    ['Bullpadel', 'Hack 05', 2027, 'diamond', '#EAEAED', '#4E4C4F', null, 'diag', '#D7263D'],
    ['Bullpadel', 'Vertex 05', 2027, 'diamond', '#565557', '#E8ECEE', '#4A484A', 'diag'],
    ['Bullpadel', 'Neuron 02', 2027, 'tear', '#50526F', '#302F30', '#484C6B', 'ring'],
    ['Bullpadel', 'Neuron 02 Edge', 2027, 'diamond', '#756975', '#363333', '#665168', 'ring'],
    ['Bullpadel', 'Neuron 02 Edge Comfort', 2027, 'diamond', '#ACABAE', '#282831', null, 'diag'],
    ['Bullpadel', 'Elite W 02', 2027, 'tear', '#DDE5D7', '#2F2F2F', null, 'diag'],
    ['Bullpadel', 'Pearl', 2027, 'diamond', '#EAEAEE', '#C79673', null, 'diag'],
    ['Bullpadel', 'Vertex 05 W', 2027, 'diamond', '#F7CCA8', '#4E4647', '#F4B89B', 'diag'],
    ['Bullpadel', 'Wonder', 2027, 'tear', '#4A484D', '#CCD2EC', null, 'diag', '#E36FA0'],
    ['Bullpadel', 'Icon', 2027, 'diamond', '#2F3031', '#5A5A5E', null, 'diag'],
    ['Bullpadel', 'Flow Legend', 2027, 'diamond', '#E6CEB1', '#4C4A4D', null, 'diag'],
    ['Bullpadel', 'Hack 05 Comfort', 2027, 'diamond', '#EE394D', '#F5F5F5', '#D43248', 'diag'],
    ['Bullpadel', 'Xplo 02 Comfort', 2027, 'diamond', '#4C4A50', '#B1B1B6', '#0A0A0A', 'diag', '#2FB5B5'],
    ['Bullpadel', 'Nitro Woman', 2027, 'tear', '#2F526E', '#B0E2E8', '#0F2F4B', 'diag'],
    ['Bullpadel', 'Nitro Power', 2027, 'diamond', '#111015', '#E4E6EC', null, 'diag'],
    // ----- Nox -----
    ['Nox', 'AT10 Genius 12K Xtreme', 2027, 'tear', '#E7E7E9', '#AFADAE', null, 'x'],
    ['Nox', 'AT10 Genius 18K', 2027, 'tear', '#CDCAD0', '#8E8B92', null, 'x'],
    ['Nox', 'Genius Attack 18K', 2027, 'diamond', '#CCCBCF', '#8E8E92', null, 'x'],
    ['Nox', 'Genius Attack 12K Xtreme', 2027, 'diamond', '#E7E7E8', '#B1B1B2', null, 'x'],
    ['Nox', 'Ventus Hybrid 12K Xtrem', 2027, 'tear', '#106CD7', '#E8E8EA', '#0C53CA', 'x'],
    ['Nox', 'Genius 12K Xtrem Lite', 2027, 'tear', '#EAEAEA', '#B0B1B1', null, 'x'],
    ['Nox', 'Ventus Attack 12K Xtreme', 2027, 'diamond', '#318B6E', '#DADDDD', '#12512F', 'x'],
    ['Nox', 'AT10 Genius 18K', 2026, 'tear', '#323134', '#AFAEAD', '#282828', 'x'],
    ['Nox', 'Nerbo + 12K', 2026, 'diamond', '#484C54', '#6C6E74', '#B40809', 'x'],
    ['Nox', 'X-Auro', 2026, 'round', '#EBEBEF', '#0C0C0F', null, 'x'],
    ['Nox', 'EA10 Ventus Hybrid 12K Xtreme', 2026, 'tear', '#CD2A33', '#4F4A4F', '#0D090B', 'x'],
    ['Nox', 'Future Hybrid 12K', 2025, 'tear', '#565A64', '#CBCED2', '#464850', 'x'],
    ['Nox', 'Future Control 12K', 2025, 'round', '#686B75', '#CACCD0', '#494B53', 'x'],
    ['Nox', 'Future Attack 12K', 2025, 'diamond', '#50505A', '#B1AEB3', '#47464E', 'x', '#D7263D'],
    ['Nox', 'AT10 Genius 18K Buenos Aires', 2025, 'tear', '#E3E5EA', '#9CC6E8', null, 'x', '#D4AF37'],
    ['Nox', 'Nextgen Pro Hybrid 3K', 2025, 'tear', '#D2D3D8', '#6F717A', null, 'x'],
    // ----- Adidas -----
    ['Adidas', 'Drive 3.4 White/Yellow', 2027, 'round', '#F5F5E7', '#1F1F1F', '#EAED2A', 'stripes'],
    ['Adidas', 'Drive 3.4 Yellow', 2027, 'round', '#EAED2A', '#1F1F1F', null, 'stripes'],
    ['Adidas', 'Metalbone', 2026, 'diamond', '#2D2C2F', '#919194', '#0F0E10', 'stripes'],
    ['Adidas', 'Metalbone HRD+', 2026, 'diamond', '#2E2D2B', '#6A6764', '#1C1C1C', 'stripes', '#E8792B'],
    ['Adidas', 'Arrow Hit Light', 2026, 'diamond', '#26272B', '#347071', null, 'stripes', '#3FB8AF'],
    ['Adidas', 'Cross It Light 3.4', 2025, 'round', '#D6D6D8', '#4A4A4A', null, 'stripes'],
    ['Adidas', 'RX Series Light 3.4', 2025, 'round', '#E8E8EA', '#5C8FD6', null, 'stripes'],
    ['Adidas', 'Match 3.4 White/Blue', 2027, 'tear', '#F0F0F5', '#2E4FC2', null, 'stripes'],
    ['Adidas', 'Match 3.4 Blue', 2027, 'tear', '#1E2A55', '#E8E8EE', null, 'stripes', '#D33F3F'],
    ['Adidas', 'Metalbone Pro-EDT', 2026, 'diamond', '#B3202A', '#2B2B2E', '#2B2B2E', 'stripes'],
    ['Adidas', 'Metalbone Zidane Carbon', 2026, 'tear', '#EDEDF0', '#B9BCC3', null, 'stripes'],
    ['Adidas', 'Cross It Light Milano', 2026, 'round', '#1F3A5A', '#C9A55A', null, 'stripes'],
    ['Adidas', 'Metalbone Ctrl', 2026, 'round', '#E9E9EB', '#2E2E30', null, 'stripes'],
    ['Adidas', 'Metalbone Reserve EDT', 2026, 'diamond', '#F2EDE6', '#7A1F2B', null, 'wave'],
    ['Adidas', 'Arrow Hit Attk', 2026, 'diamond', '#2A2A2D', '#8C8C90', null, 'stripes'],
    ['Adidas', 'Arrow Hit Ctrl', 2026, 'round', '#2A2A2D', '#E07A2E', null, 'stripes'],
    // ----- Babolat -----
    ['Babolat', 'Viper 3.1', 2027, 'diamond', '#EDEDF0', '#D23D9A', '#2B2B33', 'chev band'],
    ['Babolat', 'Viper Soft 3.1', 2027, 'diamond', '#DADCE2', '#E1A6C4', null, 'chev band'],
    ['Babolat', 'Veron 3.1', 2027, 'diamond', '#A9D6D6', '#33475A', null, 'chev band'],
    ['Babolat', 'Technical Origin+', 2027, 'diamond', '#C8202F', '#2B2B2F', null, 'chev band'],
    ['Babolat', 'Lamborghini Orange', 2026, 'tear', '#F06A1C', '#1C1C1E', null, 'band'],
    ['Babolat', 'Lamborghini Bronze', 2026, 'tear', '#C9A27A', '#3A3A3C', null, 'band'],
    ['Babolat', 'Viper 3.0', 2026, 'diamond', '#F2511B', '#B9C0CB', '#15171C', 'chev band'],
    ['Babolat', 'Technical Viper 3.0', 2026, 'diamond', '#2A2A30', '#C8202F', null, 'chev band'],
    ['Babolat', 'Viper 3.0 Blue', 2026, 'diamond', '#1D2B4A', '#4CC38A', null, 'chev band'],
    // ----- Head -----
    ['Head', 'Coello Pro', 2026, 'diamond', '#3E393B', '#E9E3E0', null, 'peak', '#D9534F'],
    ['Head', 'Coello Motion', 2026, 'diamond', '#5A4F51', '#E8E2DF', null, 'peak', '#D9534F'],
    ['Head', 'Extreme Pro', 2026, 'diamond', '#1F2324', '#C8E86A', null, 'peak'],
    ['Head', 'Extreme Motion', 2026, 'diamond', '#D7DCE0', '#2D3236', null, 'peak'],
    ['Head', 'Coello Team', 2026, 'diamond', '#5A4F51', '#E8E2DF', null, 'peak'],
    ['Head', 'Radical Pro', 2026, 'tear', '#E8333A', '#1E1E1E', null, 'peak'],
    ['Head', 'Radical Team', 2026, 'tear', '#EF4B3C', '#1E1E1E', '#1F4D55', 'peak'],
    ['Head', 'Bolt Red/Black', 2026, 'tear', '#E43D35', '#1A1A1A', '#1A1A1A', 'peak'],
    ['Head', 'Vibe Blue/Yellow', 2026, 'tear', '#3E5A66', '#E8E25A', null, 'peak'],
    // ----- Siux -----
    ['Siux', 'Diablo Pro SE', 2026, 'tear', '#4BA3E0', '#2A3550', null, 'diag'],
    ['Siux', 'Fenix Pro Mad', 2026, 'diamond', '#2A2B30', '#8D8F96', null, 'diag'],
    ['Siux', 'Diablo Pro MX', 2026, 'tear', '#2E2F33', '#C9B458', null, 'diag'],
    ['Siux', 'Diablo Pro Royal Blue', 2026, 'tear', '#1E2E5A', '#3E63B8', null, 'diag'],
    ['Siux', 'Fenix Pro Black', 2026, 'diamond', '#232327', '#5A5B61', null, 'diag'],
    ['Siux', 'Electra Pro Shadow Red', 2026, 'tear', '#2A2628', '#8E2430', null, 'diag'],
    ['Siux', 'Fenix Pro Glow Purple', 2026, 'diamond', '#2B2830', '#B6E33A', null, 'diag', '#8E5BD6'],
    ['Siux', 'Electra Pro Fire Red', 2026, 'tear', '#3A3A3E', '#D9363E', null, 'diag'],
    // ----- StarVie -----
    ['StarVie', 'Eternal', 2027, 'tear', '#F2F2F2', '#1A1A1A', null, 'star', '#D4A84A'],
    ['StarVie', 'Raptor +', 2027, 'tear', '#1C1C1E', '#EDEDED', null, 'star', '#D7263D'],
    ['StarVie', 'Black Titan', 2027, 'tear', '#1E1C1E', '#B5232B', null, 'star'],
    ['StarVie', 'Triton T-One', 2027, 'diamond', '#2C2C30', '#EDEDED', null, 'star'],
    ['StarVie', 'Triton + Power', 2027, 'tear', '#2C2D31', '#B9BBC1', null, 'star'],
    ['StarVie', 'Triton Balance +', 2027, 'diamond', '#2A2A2C', '#C9A24A', null, 'star'],
    ['StarVie', 'Astrum +', 2027, 'tear', '#1E1E20', '#EDEDED', null, 'star'],
    // ----- Wilson -----
    ['Wilson', 'Defy Pro V1 Special Edition', 2026, 'diamond', '#E9E9EC', '#2A2A2C', null, 'w', '#C9A24A'],
    ['Wilson', 'Defy V1 Special Edition', 2026, 'diamond', '#EDEDF0', '#2A2A2C', null, 'w'],
    ['Wilson', 'Defy LS V1 Special Edition', 2026, 'diamond', '#EDEDF0', '#8C6A3A', null, 'w'],
    ['Wilson', 'Endure V1', 2026, 'tear', '#6FA3D6', '#FFFFFF', null, 'w'],
    ['Wilson', 'Blade V4 Green', 2026, 'tear', '#2E8A73', '#FFFFFF', null, 'w'],
    ['Wilson', 'Blade LS V4 Green', 2026, 'tear', '#9EE0D6', '#FFFFFF', null, 'w'],
    ['Wilson', 'Blade LS V4 Pink', 2026, 'tear', '#F4B6C6', '#FFFFFF', null, 'w'],
    // ----- Kombat -----
    ['Kombat', 'Vesubio', 2025, 'diamond', '#222326', '#2FBF8F', null, 'diag'],
    ['Kombat', 'Teide', 2025, 'diamond', '#222326', '#3FA7E0', null, 'diag'],
    ['Kombat', 'Etna', 2025, 'diamond', '#2A2A2D', '#E5E5E8', null, 'diag'],
    ['Kombat', 'Fuji', 2026, 'tear', '#2C2A2E', '#E0457B', null, 'diag'],
    // ----- Royal Padel -----
    ['Royal Padel', 'Control', 2026, 'diamond', '#3A3F44', '#3FBFA5', null, 'diag'],
    ['Royal Padel', 'M27 Poly', 2026, 'round', '#2E2F33', '#EDEDED', null, 'diag'],
    ['Royal Padel', 'M27 Light', 2026, 'round', '#2E2F33', '#E06BA8', null, 'diag'],
    // ----- Black Crown -----
    ['Black Crown', 'Special Invictus', 2025, 'tear', '#1C1C1E', '#E2B23A', null, 'wave'],
    ['Black Crown', 'Patron Xtrem', 2025, 'tear', '#1F2742', '#3E7BE0', null, 'wave'],
    // ----- Lok -----
    ['Lok', 'Carbon Hype Gen 2', 2026, 'diamond', '#1C1C1E', '#F28B2C', null, 'wave']
  ];
  function slug(s) { return String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); }
  PadPal.RACKET_LIST = L.map(function (r) {
    return { id: slug(r[0] + ' ' + r[1] + ' ' + r[2]), brand: r[0], model: r[1], year: r[2], shape: r[3],
      c: [r[4], r[5], r[6], null, r[8] || null], p: r[7] };
  });
})();
