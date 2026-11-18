const stages = [
  {
    id: 1,
    kicker: { zh: "Step 1", en: "Step 1" },
    title: {
      zh: "去遮挡角色头部四视图",
      en: "Unobstructed character head turnaround",
    },
    presets: [
      {
        key: "general",
        label: { zh: "通用 Prompt", en: "General prompt" },
        zh: `请根据我上传的参考图，生成这个角色“去遮挡后的头部四视图设定图”。\n\n参考图分工如下：\n1. 结构参考图：用于确定角色的头部结构、发型轮廓、耳朵位置、侧脸轮廓、后脑和背面发型。\n2. 表情参考图：用于确定角色的眉毛、眼神、眼睑形状、嘴巴和整体表情。\n3. 官方角色图：用于确定角色气质、配色、虹膜颜色和角色识别感。\n\n请生成一张干净的角色头部四视图设定图，包括：正面、左前45度、左侧面、背面。\n\n要求：去掉遮挡物，例如兜帽、帽子、面罩等，但保留角色必要的小发饰。只保留头部、头发、耳朵和必要饰品。保留角色原本的表情、眼神和气质。发型结构应根据结构参考图合理补全。不要改成普通萌系脸。不要把脸做得太3D、太写实、太立体。不要生成kigurumi头壳。不要生成真人、cosplay、娃娃、手办、3D渲染风格。白色背景，角色设定图风格，结构清晰。四个视角必须是同一个角色、同一个发型、同一个表情系统。`,
        en: `Use the uploaded references to generate an unobstructed four-view character head design sheet.\n\nReference roles:\n1. Structure references define head shape, hairstyle silhouette, ear position, side profile, back of head, and rear hairstyle.\n2. Expression references define eyebrows, gaze, eyelids, mouth shape, and emotion.\n3. Official character art defines character identity, color palette, iris color, and overall temperament.\n\nCreate a clean head turnaround with front, left 45-degree, left side, and back views.\n\nRequirements: remove obstructing items such as hoods, hats, masks, or face coverings, while keeping necessary small hair accessories. Keep only the head, hair, ears, and required accessories. Preserve the character's original expression, gaze, and temperament. Complete the hairstyle logically from structural references. Do not turn it into a generic cute face. Do not make the face too 3D, realistic, or sculpted. Do not create a kigurumi head shell yet. Do not create a real person, cosplay, doll, figure, or 3D render. Use a white background and clear character design-sheet style. All four views must show the same character, same hairstyle, and same expression system.`,
      },
      {
        key: "expression",
        label: { zh: "表情修正", en: "Expression fix" },
        zh: "请基于当前四视图设定图进行微调，不要重新设计角色。\n\n当前发型结构和四视图一致性基本正确，请保持不变。这次只重点修正表情。\n\n请根据目标表情参考图调整：眉毛角度、眼神、上眼睑和下眼睑形状、嘴巴形状、整体情绪。\n\n要求：表情更接近参考图。不要自动微笑，除非参考图本身就是微笑。不要改成普通可爱表情。不要让表情过度夸张。保持角色原本气质。\n\n输出仍然是同一个角色的头部四视图设定图。",
        en: "Refine the current four-view design sheet without redesigning the character.\n\nThe hairstyle structure and four-view consistency are mostly correct; keep them unchanged. Focus only on the expression.\n\nAdjust eyebrow angle, gaze, upper and lower eyelid shapes, mouth shape, and overall emotion according to the target expression reference.\n\nRequirements: make the expression closer to the reference. Do not add a smile unless the reference is smiling. Do not turn it into a generic cute expression. Do not exaggerate the expression. Preserve the character's temperament.\n\nOutput the same character head four-view design sheet.",
      },
      {
        key: "face",
        label: { zh: "正脸修正", en: "Front face fix" },
        zh: "请基于当前四视图设定图进行微调，不要重新设计角色。\n\n当前发型和四视图一致性基本正确，请保持不变。这次重点修正正脸五官。\n\n请根据正脸参考图调整：眼睛形状、眼距、眉眼关系、嘴巴位置、脸部比例、虹膜颜色和眼神。\n\n要求：正脸更接近目标角色。不要改变发型结构。不要改变角色身份。不要变成普通模板脸。不要把脸变得更3D、更写实或更立体。\n\n输出仍然是角色头部四视图设定图。",
        en: "Refine the current four-view design sheet without redesigning the character.\n\nThe hairstyle and four-view consistency are mostly correct; keep them unchanged. Focus on the front-view facial features.\n\nAdjust eye shape, eye spacing, eyebrow-eye relationship, mouth position, facial proportions, iris color, and gaze according to the front-face reference.\n\nRequirements: make the front face closer to the target character. Do not change the hairstyle structure or character identity. Do not turn it into a generic template face. Do not make it more 3D, realistic, or sculpted.\n\nOutput the character head four-view design sheet.",
      },
      {
        key: "childlike",
        label: { zh: "脸型幼态化", en: "Rounder childlike face" },
        zh: "请基于当前四视图设定图进行脸型修正，不要重新设计角色。\n\n当前问题是脸型偏尖、偏成熟，不够幼态。\n\n请重点调整：下巴缩短；下巴更圆、更钝、更小；下半张脸缩短；脸颊更饱满；下颌线更柔和；整体脸型更圆润、更幼态；不要长脸；不要尖下巴；不要成熟脸。\n\n同时保持：发型结构不变；表情不变；角色识别度不变；四视图排版不变。\n\n输出仍然是同一个角色的头部四视图设定图。",
        en: "Correct the face shape in the current four-view design sheet without redesigning the character.\n\nThe current issue is that the face is too sharp, mature, and not childlike enough.\n\nAdjust: shorten the chin; make the chin rounder, blunter, and smaller; shorten the lower face; make cheeks fuller; soften the jawline; make the overall face rounder and more childlike; avoid a long face, pointed chin, or mature face.\n\nKeep the hairstyle structure, expression, character identity, and four-view layout unchanged.\n\nOutput the same character head four-view design sheet.",
      },
    ],
  },
  {
    id: 2,
    kicker: { zh: "Step 2", en: "Step 2" },
    title: {
      zh: "Kigurumi 头壳四视图设计图",
      en: "Kigurumi head shell design turnaround",
    },
    presets: [
      {
        key: "general",
        label: { zh: "通用 Prompt", en: "General prompt" },
        zh: `请根据我上传的参考图，把角色头部四视图设定图转换成 animegao kigurumi 头壳四视图设计图。\n\n参考图分工如下：\n1. 角色头部四视图设定图：作为最重要的主参考，用于确定目标角色的身份、发型结构、发色、耳朵位置、脸型方向、眼睛形状、整体比例和四视图关系。\n2. 目标表情参考图：只用于参考最终表情，尤其是眉毛、眼神、眼睑形状和嘴巴形状。\n3. kigurumi头壳案例图：只用于参考animegao kigurumi头壳的比例语言、面壳结构、眼眶处理、假发处理方式和设计完成度。不要复制案例图中的角色五官、发型和配色。\n\n请生成一张kigurumi头壳四视图设计图，包括：正面、左前45度、左侧面、背面。\n\n要求：必须是kigurumi头壳设计图，不是普通动漫头像。必须是实体可制作的头壳，有硬质面壳、固定表情、假发和必要饰品。保留目标角色的发型、发色、耳朵、眼睛颜色、眼神和整体气质。表情必须接近目标表情参考图。脸型保持幼态、圆润、短下巴，不要变成长脸或尖下巴。面部适合animegao kigurumi头壳：鼻子弱化，嘴巴简化，脸部平滑，不要过度立体。眼睛应是animegao kigurumi风格的大眼睛，有明确眼眶结构、眼线和睫毛。不要变成真人眼、玻璃眼或3D娃娃眼。假发可以有真实发丝质感，但整体发型轮廓必须保持角色设定图中的形状。四个视角必须是同一个头壳连续旋转展示。白色背景，清晰设计图风格，适合作为后续商品照和店家制作参考。\n\n禁止：不要生成真人。不要生成cosplay妆面。不要生成普通动漫插画头像。不要生成3D手办或BJD娃娃。不要生成过度写实的皮肤纹理。不要生成明显唇彩。不要让脸部变得太立体。不要改变角色发型结构。不要加入原本已经去掉的遮挡物。`,
        en: `Convert the uploaded character head four-view design sheet into an animegao kigurumi head shell four-view design sheet.\n\nReference roles:\n1. Character head turnaround is the primary reference for identity, hairstyle structure, hair color, ear position, face direction, eye shape, proportions, and view relationships.\n2. Target expression references are only for final expression: eyebrows, gaze, eyelids, and mouth shape.\n3. Kigurumi examples are only for animegao kigurumi proportions, face shell structure, eye-socket treatment, wig handling, and design finish. Do not copy their character features, hairstyle, or colors.\n\nCreate a kigurumi head shell four-view design sheet with front, left 45-degree, left side, and back views.\n\nRequirements: it must be a kigurumi head shell design, not a normal anime avatar. It must look like a physical manufacturable shell with a hard face shell, fixed expression, wig, and required accessories. Preserve the target character's hairstyle, hair color, ears, eye color, gaze, and temperament. The expression must match the target expression reference. Keep the face childlike, round, and short-chinned; avoid a long or pointed chin. The face should suit animegao kigurumi: weakened nose, simplified mouth, smooth face, and not overly sculpted. Eyes should be large animegao kigurumi eyes with clear eye-socket structure, eyeliner, and lashes. Do not make them real human eyes, glass eyes, or 3D doll eyes. The wig may have realistic fiber texture, but the overall silhouette must match the character design sheet. All four views must show the same head shell as a continuous rotation. White background, clear design-sheet style, suitable for product-photo generation and maker reference.\n\nForbidden: real person, cosplay makeup, normal anime illustration avatar, 3D figure, BJD doll, realistic skin texture, obvious lip gloss, overly sculpted face, changed hairstyle structure, or reintroduced removed obstructions.`,
      },
      {
        key: "shell",
        label: { zh: "头壳感不足", en: "More shell-like" },
        zh: "请基于当前结果继续修改，不要重新设计角色。\n\n当前问题是：结果仍然太像普通动漫头像，kigurumi头壳感不足。\n\n请加强kigurumi头壳特征：明确表现为实体animegao kigurumi头壳。面部是硬质平滑面壳，不是普通绘画脸。眼睛有头壳眼眶结构，不是普通插画眼睛。眼线、睫毛、眼眶厚度更像真实kigurumi头壳。脸部保持固定表情，有面具感和实体头壳感。假发作为头壳上的真实假发存在，而不是普通插画头发。侧面要有头壳厚度和后脑体积。\n\n请保持：目标角色的发型、发色、耳朵、眼睛颜色和整体气质。当前四视图排版。幼态圆润脸型。目标表情。\n\n输出仍然是kigurumi头壳四视图设计图。",
        en: "Continue modifying the current result without redesigning the character.\n\nThe current issue: it still looks too much like a normal anime avatar and not enough like a kigurumi head shell.\n\nStrengthen the kigurumi shell features: clearly present it as a physical animegao kigurumi head shell. The face should be a hard smooth shell, not a normal drawn face. Eyes should have head-shell eye-socket structure, not ordinary illustration eyes. Eyeliner, lashes, and socket thickness should look closer to a real kigurumi shell. The face should have a fixed expression with mask-like physical shell presence. The wig should exist as a real wig mounted on the shell, not ordinary illustrated hair. Side view should show shell thickness and back-head volume.\n\nKeep the target character's hairstyle, hair color, ears, eye color, temperament, current four-view layout, round childlike face, and target expression.\n\nOutput the kigurumi head shell four-view design sheet.",
      },
      {
        key: "too3d",
        label: { zh: "太3D/太娃娃", en: "Less 3D or doll-like" },
        zh: "请基于当前结果继续修改，不要重新设计角色。\n\n当前问题是：脸部太3D、太立体、太像娃娃或手办，不够像animegao kigurumi头壳。\n\n请调整为更平滑、更简化的kigurumi面壳风格：脸部不要有过强的立体塑形。鼻子进一步弱化。嘴巴进一步简化。不要明显唇彩。不要真实皮肤纹理。不要真人感。面壳应是平滑硬质表面，而不是3D角色脸或BJD娃娃脸。脸型保持圆润幼态，短下巴，柔和脸颊。眼睛保持animegao大眼风格，但不要变成玻璃眼或3D眼球。\n\n请保持：目标角色的发型结构和耳朵。四视图一致。目标表情。白色背景和设计图排版。\n\n输出仍然是kigurumi头壳四视图设计图。",
        en: "Continue modifying the current result without redesigning the character.\n\nThe current issue: the face is too 3D, too sculpted, too much like a doll or figure, and not enough like an animegao kigurumi shell.\n\nAdjust it to a smoother, simpler kigurumi face-shell style: avoid strong facial sculpting. Weaken the nose further. Simplify the mouth further. Avoid obvious lip gloss, realistic skin texture, and human realism. The shell should be a smooth hard surface, not a 3D character face or BJD doll face. Keep the face round, childlike, short-chinned, and soft-cheeked. Keep animegao large-eye style, but avoid glass eyes or 3D eyeballs.\n\nKeep the target character's hairstyle structure, ears, four-view consistency, target expression, white background, and design-sheet layout.\n\nOutput the kigurumi head shell four-view design sheet.",
      },
      {
        key: "expression",
        label: { zh: "表情跑偏", en: "Expression drift" },
        zh: "请基于当前kigurumi头壳四视图进行表情修正，不要重新设计头壳。\n\n当前头壳结构、发型和四视图关系基本保留，请重点修改表情。\n\n请根据目标表情参考图调整：眉毛角度、眼神方向和情绪、上眼睑和下眼睑形状、嘴巴形状、整体气质。\n\n要求：表情必须更接近参考图。不要自动微笑，除非参考图本身就是微笑。不要改成普通可爱表情。不要让表情过度夸张。表情修改时不要改变发型、耳朵、脸型和四视图排版。\n\n输出仍然是同一个kigurumi头壳四视图设计图。",
        en: "Fix the expression in the current kigurumi head shell four-view sheet without redesigning the shell.\n\nThe shell structure, hairstyle, and view relationships are mostly preserved; focus on expression.\n\nAdjust eyebrow angle, gaze direction and emotion, upper and lower eyelid shapes, mouth shape, and overall temperament according to the expression reference.\n\nRequirements: the expression must be closer to the reference. Do not add a smile unless the reference is smiling. Do not turn it into a generic cute expression. Do not exaggerate. Do not change hairstyle, ears, face shape, or four-view layout while fixing expression.\n\nOutput the same kigurumi head shell four-view design sheet.",
      },
      {
        key: "face",
        label: { zh: "脸型变尖", en: "Pointed face fix" },
        zh: "请基于当前kigurumi头壳四视图进行脸型修正，不要重新设计头壳。\n\n当前问题是：脸型又变得偏尖、偏成熟，不够幼态。\n\n请重点修正脸型：下巴缩短。下巴更圆、更钝、更小。下半张脸缩短。脸颊更饱满。下颌线更柔和。整体脸型更偏圆润幼态。不要长脸。不要尖下巴。不要成熟脸。\n\n同时保持：发型结构不变。耳朵位置不变。表情不变。眼睛颜色和角色气质不变。四视图排版不变。仍然是kigurumi头壳设计图。",
        en: "Correct the face shape in the current kigurumi head shell four-view sheet without redesigning the shell.\n\nThe current issue: the face became too pointed, mature, and not childlike enough.\n\nFix the face shape: shorten the chin; make the chin rounder, blunter, and smaller; shorten the lower face; make cheeks fuller; soften the jawline; make the overall face rounder and more childlike; avoid a long face, pointed chin, or mature face.\n\nKeep hairstyle structure, ear position, expression, eye color, character temperament, four-view layout, and kigurumi shell design identity unchanged.",
      },
    ],
  },
  {
    id: 3,
    kicker: { zh: "Step 3", en: "Step 3" },
    title: {
      zh: "商品照风格四面/八面视图",
      en: "Product-style four/eight-view reference",
    },
    presets: [
      {
        key: "four",
        label: { zh: "四面图 Prompt", en: "Four-view prompt" },
        zh: `请基于上传的kigurumi头壳设计图，生成最终的kigurumi头壳商品照四面视图。\n\n参考图分工如下：\n1. kigurumi头壳设计图：作为最终头壳结构、发型、脸型、眼睛、耳朵和表情的主要依据。\n2. 商品照案例图：只用于参考拍摄质量、白底商品照风格、头壳材质、假发质感和展示方式。\n3. 表情参考图：用于确认最终眉毛、眼神和嘴巴的情绪。\n\n请生成一张白底商品照风格的kigurumi头壳四面视图，包括：正面、左前45度、左侧面、背面。\n\n要求：成品必须是kigurumi头壳商品照，不是插画，不是普通动漫头像，不是真人cosplay。四个视角必须是同一个头壳，结构一致。保留目标角色的发型、耳朵、发色、眼睛颜色和整体气质。表情必须符合参考图，尤其是眉毛、眼神、嘴巴。面壳为平滑硬质头壳，脸部不要过度立体。鼻子弱化，嘴巴简洁。不要明显唇彩，不要真人皮肤纹理，不要真实人脸感。假发可以有真实纤维质感，但整体仍然保持animegao kigurumi风格。白色背景，干净商品图排版，高质量。`,
        en: `Generate the final kigurumi head shell product-photo four-view sheet based on the uploaded kigurumi shell design.\n\nReference roles:\n1. Kigurumi head shell design is the main basis for final shell structure, hairstyle, face shape, eyes, ears, and expression.\n2. Product photo examples are only for shooting quality, white-background product style, shell material, wig texture, and display method.\n3. Expression reference confirms eyebrow, gaze, and mouth emotion.\n\nCreate a white-background product-photo style kigurumi head shell four-view sheet: front, left 45-degree, left side, and back.\n\nRequirements: the final image must be a kigurumi head shell product photo, not an illustration, normal anime avatar, or real cosplay. All four views must show the same head shell with consistent structure. Preserve the target character's hairstyle, ears, hair color, eye color, and temperament. Expression must match the reference, especially eyebrows, gaze, and mouth. The face shell should be smooth and hard, not overly sculpted. Weaken the nose and keep the mouth simple. Avoid obvious lip gloss, realistic skin texture, or real human face feeling. Wig may have realistic fiber texture while staying animegao kigurumi. White background, clean product layout, high quality.`,
      },
      {
        key: "eight",
        label: { zh: "八面图 Prompt", en: "Eight-view prompt" },
        zh: `请基于上传的kigurumi头壳设计图，生成最终的kigurumi头壳商品照八面视图。\n\n请输出八个视角：正面、左前45度、左侧面、左后45度、背面、右后45度、右侧面、右前45度。\n\n参考图分工如下：\n1. kigurumi头壳设计图：作为最终头壳结构、发型、脸型、眼睛、耳朵和表情的主要依据。\n2. 商品照案例图：只用于参考拍摄质量、白底商品照风格、头壳材质、假发质感和展示方式。\n3. 表情参考图：用于确认最终眉毛、眼神和嘴巴的情绪。\n\n要求：成品必须是kigurumi头壳商品照八面视图。八个视角必须是同一个头壳连续旋转展示，不能变成八个不同角色。保留目标角色的发型、耳朵、发色、眼睛颜色和整体气质。表情必须符合参考图，尤其是眉毛、眼神、嘴巴。面壳为平滑硬质头壳，脸部不要过度立体。鼻子弱化，嘴巴简洁。不要明显唇彩，不要真人皮肤纹理，不要真实人脸感。假发可以有真实纤维质感，但整体仍然保持animegao kigurumi风格。白色背景，干净商品图排版，高质量。`,
        en: `Generate the final kigurumi head shell product-photo eight-view sheet based on the uploaded kigurumi shell design.\n\nOutput eight views: front, left 45-degree, left side, left rear 45-degree, back, right rear 45-degree, right side, and right 45-degree.\n\nReference roles:\n1. Kigurumi head shell design is the main basis for final shell structure, hairstyle, face shape, eyes, ears, and expression.\n2. Product photo examples are only for shooting quality, white-background product style, shell material, wig texture, and display method.\n3. Expression reference confirms eyebrow, gaze, and mouth emotion.\n\nRequirements: the final image must be a kigurumi head shell product-photo eight-view sheet. All eight views must show the same head shell as a continuous rotation, not eight different characters. Preserve the target character's hairstyle, ears, hair color, eye color, and temperament. Expression must match the reference, especially eyebrows, gaze, and mouth. The face shell should be smooth and hard, not overly sculpted. Weaken the nose and keep the mouth simple. Avoid obvious lip gloss, realistic skin texture, or real human face feeling. Wig may have realistic fiber texture while staying animegao kigurumi. White background, clean product layout, high quality.`,
      },
    ],
  },
];
