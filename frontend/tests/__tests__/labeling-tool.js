let utils = {
  goto: async where => {
    await page.goto(where);
    await page.waitFor(500);
  },
  $$: async element => {
    await page.waitForSelector(element);
    return await page.$$(element);
  },
  $eval: async (element, event) => {
    await page.waitForSelector(element, {
      visible: true,
    });
    return await page.$eval(
      element,
      (el, event) => {
        switch (event) {
          case 'innerText':
            return el.innerText;
            break;
        }
      },
      event
    );
  },
  $$eval: async (element, num, event) => {
    await page.waitForSelector(element, {
      visible: true,
    });
    return await page.$$eval(
      element,
      (els, num, event) => {
        switch (event) {
          case 'top':
            return els[num].style.top;
            break;
          case 'left':
            return els[num].style.left;
            break;
        }
      },
      num,
      event
    );
  },
  type: async (element, data) => {
    await page.waitForSelector(element, {
      visible: true,
    });
    await page.type(element, data);
    await page.waitFor(500);
  },
  click: async (element, options) => {
    await page.waitForSelector(element, {
      visible: true,
    });
    await page.click(element, options);
    await page.waitFor(500);
  },
  press: async keyCode => {
    await page.keyboard.press(keyCode);
    await page.waitFor(500);
  },
  waitForLoading: async element => {
    await page.waitForFunction(
      element => !document.querySelector(element),
      {
        timeout: 50000,
      },
      element
    );
    await page.waitFor(500);
  },
};

describe('labeling-tool', () => {
  jest.setTimeout(50000);
  let countBeforeProject, countAfterProject;
  let top1, top2, left1, left2;
  beforeAll(async () => {
    await page.setViewport({
      width: 1500,
      height: 720,
    });
    page.on('console', msg => console.log('console.log : ', msg.text));
    await utils.goto('http://localhost:8080/labeling/');
    await utils.type('input#account', 'test1@tg3ds.com');
    await utils.type('input#password', 'tg3d1234');
    await utils.click('.white--text.v-btn.theme--light');
  });

  // it('should create project & count after create project', async () => {
  //   try {
  //     await utils.waitForLoading('.v-progress-linear__bar');
  //     await utils.click(
  //       '#app > div.application--wrap > div > div.layout.justify-center > div > div > div.main-container > div.layout.pagination-section.py-3.row.justify-end.align-center > div > div.d-flex.justify-center.align-center > div.goto-page > div > div > div > div.v-select__slot > div.v-select__selections'
  //     ); //nextpage
  //     await utils.click(
  //       '#app > div.v-menu__content.theme--light.menuable__content__active > div > div > div:nth-child(2) > a'
  //     );
  //     await utils.waitForLoading('.v-progress-linear__bar');
  //     countBeforeProject = await utils.$eval('.flex.text-xs-right.xs1 > span', 'innerText');
  //     const btn_creatProject = await utils.$$('.v-btn--outline.v-btn--depressed');
  //     await btn_creatProject[4].click();
  //     await page.waitFor(500);
  //     const btn_iconBtn = await utils.$$('.v-btn--round.v-btn--small.theme--dark');
  //     await btn_iconBtn[0].click(); //X
  //     await page.waitFor(500);

  //     await utils.waitForLoading('.v-progress-linear__bar');
  //     await btn_creatProject[4].click();
  //     await utils.type('input#projectName aaa', 'abc');
  //     const btn_type = await utils.$$('.v-radio.theme--light');
  //     await btn_type[1].click();
  //     await btn_iconBtn[1].click(); //ADD+
  //     await utils.type('.tag.edit.removable', 'aaa');
  //     await utils.press('Enter');
  //     const btn_sureBtn = await utils.$$('.v-btn.v-btn--small.theme--dark');
  //     await btn_sureBtn[3].click();

  //     await utils.waitForLoading('.v-progress-linear__bar');
  //     await btn_creatProject[4].click();
  //     await utils.click('div.footerBg> button.v-btn.v-btn--outline');
  //     await utils.waitForLoading('.v-progress-linear__bar');
  //     await utils.click(
  //       '#app > div.application--wrap > div > div.layout.justify-center > div > div > div.main-container > div.layout.pagination-section.py-3.row.justify-end.align-center > div > div.d-flex.justify-center.align-center > div.goto-page > div > div > div > div.v-select__slot > div.v-select__selections'
  //     );
  //     await utils.click(
  //       '#app > div.v-menu__content.theme--light.menuable__content__active > div > div > div:nth-child(2) > a'
  //     );
  //     await utils.waitForLoading('.v-progress-linear__bar');
  //     countAfterProject = await utils.$eval('.flex.text-xs-right.xs1 > span', 'innerText');
  //     expect(parseInt(countAfterProject)).toEqual(parseInt(countBeforeProject) + 1);
  //   } catch (e) {
  //     await page.screenshot({
  //       path: 'a.png',
  //     });
  //   }
  // }, 500);

  it('should update project', async () => {
    try {
      await utils.click(
        '#app > div.application--wrap > div > div.layout.justify-center > div > div > div.main-container > div.layout.pagination-section.py-3.row.justify-end.align-center > div > div.d-flex.justify-center.align-center > div.goto-page > div > div > div > div.v-select__slot > div.v-select__selections'
      );
      await utils.click(
        '#app > div.v-menu__content.theme--light.menuable__content__active > div > div > div:nth-child(1) > a'
      );
      await utils.waitForLoading('.v-progress-linear__bar');
      let btn_moreVert = await utils.$$('.v-btn.v-btn--icon.theme--light');
      await btn_moreVert[1].click();
      await utils.click('.v-list.Zindex10.theme--light');
      await utils.waitForLoading('.vld-overlay.is-active.is-full-page');
      const btn_iconBtn = await utils.$$('.v-btn--round.v-btn--small.theme--dark');
      await btn_iconBtn[0].click();
      await utils.waitForLoading('.v-progress-linear__bar');
      btn_moreVert = await utils.$$('.v-btn.v-btn--icon.theme--light');
      await btn_moreVert[1].click();
      await utils.click('.v-list.Zindex10.theme--light');
      await utils.waitForLoading('.vld-overlay.is-active.is-full-page');
      await utils.type('input#projectName', 'bbb');
      await btn_iconBtn[1].click();
      await page.waitFor(500);
      await utils.type('.tag.edit.removable', 'bbb');
      await utils.press('Enter');
      const btn_TagBtn = await utils.$$('.tag.mr-1.mt-2.removable');
      await btn_TagBtn[0].click({
        clickCount: 2,
      });
      await page.waitFor(500);
      await utils.type('div.tag.mr-1.mt-2.edit.removable > input', 'ggg');
      await utils.click('.flex.mt-5.pl-3.xs8');
      const delete_tag = await utils.$$('.tag-icon.remove');
      await delete_tag[1].click();
      await page.waitFor(500);
      await utils.click('.v-btn--flat.theme--light.cyan--text.text--lighten-1');
      const btn_sureBtn = await utils.$$('.v-btn.v-btn--small.theme--dark');
      await btn_sureBtn[3].click();
      await page.waitFor(500);
      await page.screenshot({
        path: 'ddd.png',
      });
    } catch (e) {
      // console.log(e);
      await page.screenshot({
        path: 'b.png',
      });
    }
  }, 30000);

  // it('should edit bbox(X circle)', async () => {
  //   await utils.waitForLoading('.v-progress-linear__bar');
  //   const items = await utils.$$('.flex.list-item.clean.py-2');
  //   await items[0].click();
  //   await page.waitFor(500);
  //   await utils.waitForLoading('.vld-background');
  //   await utils.click('.crop-control.btn.btn-zoomin');
  //   await utils.click('.crop-control.btn.btn-zoomin');
  //   await utils.click('.crop-control.btn.btn-zoomin');
  //   await utils.click('.crop-control.btn.btn-zoomout');
  //   await utils.click('.crop-control.btn.btn-zoomout');
  //   await utils.click('.crop-control.btn.btn-zoomout');
  //   await utils.click('.crop-control.btn.btn-zoomout');
  //   const btn_tagBtn = await utils.$$('.v-btn--outline.v-btn--depressed.v-btn--round');
  //   await btn_tagBtn[0].click();
  //   await page.waitFor(500);
  //   await btn_tagBtn[1].click();
  //   await page.waitFor(500);
  //   await btn_tagBtn[0].click();
  //   await page.waitFor(500);
  //   await utils.click('.v-btn.v-btn--icon.transparent');
  // });

  // it('should edit bbox(circle)', async () => {
  //   await utils.waitForLoading('.v-progress-linear__bar');
  //   const items = await utils.$$('.flex.list-item.clean.py-2');
  //   await items[1].click();
  //   await page.waitFor(500);

  //   await utils.waitForLoading('.vld-background');
  //   await utils.click('.footerBg > div > div > button:nth-child(3)');

  //   await utils.waitForLoading('.vld-background');
  //   await utils.click('.crop-control.btn.btn-add');
  //   await page.mouse.move(123, 167);
  //   await page.mouse.down();
  //   await page.waitFor(500);
  //   await page.mouse.move(415, 491);
  //   await page.mouse.up();
  //   await page.waitFor(500);
  //   await utils.click('.Fill-1 > img:nth-child(2)'); //v
  //   const btn_tagBtn = await utils.$$('.v-btn--small.theme--light.white--text');
  //   await btn_tagBtn[0].click();
  //   await page.waitFor(500);

  //   await utils.click('.crop-control.btn.btn-zoomin');
  //   await utils.click('.crop-control.btn.btn-zoomin');
  //   await utils.click('.crop-control.btn.btn-zoomin');
  //   await utils.click('.crop-control.btn.btn-add');
  //   await page.mouse.move(204, 195);
  //   await page.mouse.down();
  //   await page.waitFor(500);
  //   await page.mouse.move(546, 627);
  //   await page.mouse.up();
  //   await utils.click('.Fill-1 > img:nth-child(2)'); //v
  //   await btn_tagBtn[0].click();
  //   await page.waitFor(500);
  //   await btn_tagBtn[1].click();
  //   await page.waitFor(500);

  //   await utils.click('.crop-control.btn.btn-zoomout');
  //   await utils.click('.crop-control.btn.btn-zoomout');
  //   await utils.click('.crop-control.btn.btn-zoomout');
  //   await utils.click('.crop-control.btn.btn-zoomout');
  //   await utils.click('.crop-control.btn.btn-add');
  //   await page.mouse.move(199, 134);
  //   await page.mouse.down();
  //   await page.waitFor(500);
  //   await page.mouse.move(616, 466);
  //   await page.mouse.up();
  //   await page.waitFor(500);
  //   await utils.click('.Fill-1 > img:nth-child(2)'); //v
  //   await btn_tagBtn[3].click();
  //   await page.waitFor(500);
  //   const trash = await utils.$$('.v-btn.v-btn--icon.v-btn--small.theme--dark');
  //   await trash[1].click();
  //   await page.waitFor(500);

  //   top1 = await utils.$$eval('.cropper-move', 0, 'top');
  //   left1 = await utils.$$eval('.cropper-move', 0, 'left');
  //   top2 = await utils.$$eval('.cropper-move', 1, 'top');
  //   left2 = await utils.$$eval('.cropper-move', 1, 'left');
  //   await utils.click('.footerBg > div > div > button.theme--dark');
  //   await utils.click('.v-btn.v-btn--icon.transparent');
  // });

  // it('check bbox labels XY', async () => {
  //   await page.setViewport({
  //     width: 800,
  //     height: 600,
  //   });
  //   await page.reload();
  //   await page.waitFor(500);
  //   await utils.waitForLoading('.v-progress-linear__bar');
  //   let btn_moreVert = await utils.$$('.v-btn.v-btn--icon.theme--light');
  //   await btn_moreVert[2].click();
  //   await page.waitFor(500);
  //   await utils.click('.v-list.Zindex10.theme--light');
  //   await utils.waitForLoading('.vld-overlay.is-active.is-full-page');
  //   let img_item = await utils.$$('.useLabel');
  //   await img_item[1].click();
  //   await page.waitFor(500);

  //   let newTop1 = await utils.$$eval('.cropper-move', 0, 'top');
  //   let newLeft1 = await utils.$$eval('.cropper-move', 0, 'left');
  //   let newTop2 = await utils.$$eval('.cropper-move', 1, 'top');
  //   let newLeft2 = await utils.$$eval('.cropper-move', 1, 'left');
  //   expect(top1).toEqual(newTop1);
  //   expect(left1).toEqual(newLeft1);
  //   expect(top2).toEqual(newTop2);
  //   expect(left2).toEqual(newLeft2);

  //   await page.setViewport({
  //     width: 1800,
  //     height: 1300,
  //   });
  //   await page.reload();
  //   await page.waitFor(500);
  //   await utils.waitForLoading('.v-progress-linear__bar');
  //   btn_moreVert = await utils.$$('.v-btn.v-btn--icon.theme--light');
  //   await btn_moreVert[2].click();
  //   await page.waitFor(500);
  //   await utils.click('.v-list.Zindex10.theme--light');
  //   await utils.waitForLoading('.vld-overlay.is-active.is-full-page');
  //   img_item = await utils.$$('.useLabel');
  //   await img_item[1].click();
  //   await page.waitFor(500);

  //   newTop1 = await utils.$$eval('.cropper-move', 0, 'top');
  //   newLeft1 = await utils.$$eval('.cropper-move', 0, 'left');
  //   newTop2 = await utils.$$eval('.cropper-move', 1, 'top');
  //   newLeft2 = await utils.$$eval('.cropper-move', 1, 'left');
  //   expect(top1).toEqual(newTop1);
  //   expect(left1).toEqual(newLeft1);
  //   expect(top2).toEqual(newTop2);
  //   expect(left2).toEqual(newLeft2);
  // });

  // it('from update project to edit bbox', async () => {
  //   await page.setViewport({
  //     width: 1500,
  //     height: 720,
  //   });
  //   await page.reload();
  //   await page.waitFor(500);
  //   await utils.waitForLoading('.v-progress-linear__bar');
  //   const btn_moreVert = await utils.$$('.v-btn.v-btn--icon.theme--light');
  //   await btn_moreVert[2].click();
  //   await page.waitFor(500);
  //   await utils.click('.v-list.Zindex10.theme--light');
  //   await utils.waitForLoading('.vld-overlay.is-active.is-full-page');

  //   let img_item = await utils.$$('.useLabel');
  //   await img_item[4].click();
  //   await page.waitFor(500);
  //   await utils.waitForLoading('.vld-background');
  //   await utils.click('.crop-control.btn.btn-add');
  //   await page.mouse.move(123, 167);
  //   await page.mouse.down();
  //   await page.waitFor(500);
  //   await page.mouse.move(415, 491);
  //   await page.mouse.up();
  //   await utils.click('.Fill-1 > img:nth-child(2)'); //v
  //   const btn_tagBtn = await utils.$$('.v-btn--small.theme--light.white--text');
  //   await btn_tagBtn[0].click();
  //   await page.waitFor(500);

  //   await utils.click('.crop-control.btn.btn-zoomin');
  //   await utils.click('.crop-control.btn.btn-zoomin');
  //   await utils.click('.crop-control.btn.btn-zoomin');
  //   await utils.click('.crop-control.btn.btn-add');
  //   await page.mouse.move(204, 195);
  //   await page.mouse.down();
  //   await page.waitFor(500);
  //   await page.mouse.move(546, 627);
  //   await page.mouse.up();
  //   await utils.click('.Fill-1 > img:nth-child(2)'); //v
  //   await btn_tagBtn[0].click();
  //   await page.waitFor(500);
  //   await btn_tagBtn[1].click();
  //   await page.waitFor(500);

  //   await utils.click('.crop-control.btn.btn-zoomout');
  //   await utils.click('.crop-control.btn.btn-zoomout');
  //   await utils.click('.crop-control.btn.btn-zoomout');
  //   await utils.click('.crop-control.btn.btn-zoomout');
  //   await utils.click('.crop-control.btn.btn-add');
  //   await page.mouse.move(199, 134);
  //   await page.mouse.down();
  //   await page.waitFor(500);
  //   await page.mouse.move(616, 466);
  //   await page.mouse.up();
  //   await utils.click('.Fill-1 > img:nth-child(2)'); //v
  //   await btn_tagBtn[3].click();
  //   await page.waitFor(500);
  //   const trash = await utils.$$('.v-btn.v-btn--icon.v-btn--small.theme--dark');
  //   await trash[1].click();
  //   await page.waitFor(500);

  //   const newTop1 = await utils.$$eval('.cropper-move', 0, 'top');
  //   const newLeft1 = await utils.$$eval('.cropper-move', 0, 'left');
  //   const newTop2 = await utils.$$eval('.cropper-move', 1, 'top');
  //   const newLeft2 = await utils.$$eval('.cropper-move', 1, 'left');
  //   await utils.click('.footerBg > div > div > button.theme--dark');

  //   expect(top1).toEqual(newTop1);
  //   expect(left1).toEqual(newLeft1);
  //   expect(top2).toEqual(newTop2);
  //   expect(left2).toEqual(newLeft2);
  // });

  // it('count has labels images', async () => {
  //   await utils.waitForLoading('.vld-icon');
  //   await utils.click('.img-menu');
  //   const labels_list = await utils.$$('.v-list__tile.v-list__tile--link.theme--light');
  //   await labels_list[0].click();
  //   await page.waitFor(500);
  //   await utils.waitForLoading('.vld-icon');
  //   const hasLabels = await utils.$eval('.layout.justify-end > h4', 'innerText');

  //   expect(parseInt(hasLabels)).toEqual(3);
  // });
});
