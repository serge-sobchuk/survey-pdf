import { IQuestion, Question, QuestionRatingModel, ItemValue, LocalizableString } from 'survey-core';
import { IPoint, IRect, DocController, IMargin } from './doc_controller';
import { IPdfBrick } from './pdf_render/pdf_brick';
import { TitleBrick } from './pdf_render/pdf_title';
import { TitlePanelBrick } from './pdf_render/pdf_titlepanel';
import { DescriptionBrick } from './pdf_render/pdf_description';
import { CommentBrick } from './pdf_render/pdf_comment';
import { CompositeBrick } from './pdf_render/pdf_composite';
import { RowlineBrick } from './pdf_render/pdf_rowline';
import * as jsPDF from 'jspdf';
import { HTMLBrick } from './pdf_render/pdf_html';
import { EmptyBrick } from './pdf_render/empty';

export interface IText {
    text: string;
    rect: IRect
}
export class SurveyHelper {
    static EPSILON: number = 2.2204460492503130808472633361816e-15;
    static TITLE_PANEL_FONT_SIZE_SCALE_MAGIC: number = 1.3;
    static DESCRIPTION_FONT_SIZE_SCALE_MAGIC: number = 2.0 / 3.0;
    static RATING_MIN_WIDTH: number = 3;
    static RATING_MIN_HEIGHT: number = 2;
    private static _doc: any = new jsPDF({ unit: 'pt' });
    public static setFontSize(fontSize: number, font?: string) {
        this._doc.setFontSize(fontSize);
        if (font != undefined) {
            this._doc.setFont(font)
        }
    }
    static measureText(text: number | string = 1, fontStyle: string = 'normal',
        fontSize: number = this._doc.getFontSize()) {
        let oldFontSize = this._doc.getFontSize();
        this._doc.setFontSize(fontSize);
        this._doc.setFontStyle(fontStyle);
        let height: number = this._doc.getLineHeight() / this._doc.internal.scaleFactor;
        let width: number = 0;
        if (typeof text === 'string') {
            width = text.split('').reduce((sm: number, cr: string) => sm + this._doc.getTextWidth(cr), 0);
        }
        else {
            width = height * text;
        }
        this._doc.setFontSize(oldFontSize);
        this._doc.setFontStyle('normal');
        return {
            width: width,
            height: height
        }
    }
    static mergeRects(...rects: IRect[]): IRect {
        let resultRect: IRect = {
            xLeft: rects[0].xLeft,
            xRight: rects[0].xRight,
            yTop: rects[0].yTop,
            yBot: rects[0].yBot
        };
        rects.forEach((rect: IRect) => {
            resultRect.xLeft = Math.min(resultRect.xLeft, rect.xLeft),
                resultRect.xRight = Math.max(resultRect.xRight, rect.xRight),
                resultRect.yTop = Math.min(resultRect.yTop, rect.yTop),
                resultRect.yBot = Math.max(resultRect.yBot, rect.yBot)
        });
        return resultRect;
    }
    static createPoint(rect: IRect, isLeft: boolean = true, isTop: boolean = false): IPoint {
        return {
            xLeft: isLeft ? rect.xLeft : rect.xRight,
            yTop: isTop ? rect.yTop : rect.yBot
        };
    }
    static createRect(point: IPoint, width: number, height: number): IRect {
        return {
            xLeft: point.xLeft,
            xRight: point.xLeft + width,
            yTop: point.yTop,
            yBot: point.yTop + height
        };
    }
    static createDivBlock(element: string, controller: DocController) {
        return `<div style=` + this.generateCssTextRule(controller.fontSize, controller.fontStyle, controller.doc.internal.getFont().fontName) + `>` + element + `</div>`;
    }
    static generateCssTextRule(fontSize: number, fontStyle: string, fontName: string): string {
        return `'font-size: ` + fontSize + `; font-weight:` + fontStyle + `; font-family:` + fontName + `;'`;
    }
    static splitHtmlRect(htmlBrick: IPdfBrick): IPdfBrick[] {
        let bricks: IPdfBrick[] = [];
        let brickWidth = htmlBrick.xLeft - htmlBrick.xRight;
        let sizeOfPoint = this.measureText(1, 'normal', 1).width;
        let emptyBrickCount = (htmlBrick.yBot - htmlBrick.yTop) / sizeOfPoint - 1;
        htmlBrick.yBot = htmlBrick.yTop + sizeOfPoint;
        bricks.push(htmlBrick);
        let currPoint = SurveyHelper.createPoint(htmlBrick);
        for (let i = 0; i < emptyBrickCount; i++) {
            let emptyBrick = new EmptyBrick(SurveyHelper.createRect(currPoint, brickWidth, sizeOfPoint))
            bricks.push(emptyBrick);
            currPoint = SurveyHelper.createPoint(emptyBrick);
        }
        return bricks;
    }
    static createTextFlat(point: IPoint, question: IQuestion,
        controller: DocController, text: string): IPdfBrick {
        let bricks: IPdfBrick[] = this.splitHtmlRect(this.createHTMLFlat(point, <Question>question, controller, this.createDivBlock(text, controller)));
        return new CompositeBrick(...bricks);
    }
    static htmlMargins(controller: DocController) {
        return {
            top: controller.margins.marginTop,
            bottom: controller.margins.marginBot,
            left: controller.margins.marginLeft,
            width: controller.paperWidth - controller.margins.marginLeft - controller.margins.marginRight,
        }
    }
    static createHTMLFlat(point: IPoint, question: Question, controller: DocController, html: any): IPdfBrick {
        let margins = this.htmlMargins(controller);
        let result = SurveyHelper._doc.fromHTML(html, point.xLeft, margins.top, {
            'pagesplit': true,
            width: margins.width
        }, function () { }, margins);
        let y: number;
        y = (SurveyHelper._doc.getNumberOfPages() - 1) *
            (controller.paperHeight - controller.margins.marginBot - controller.margins.marginTop)
            + result.y - margins.top;
        for (let i = 0; i < SurveyHelper._doc.getNumberOfPages() - 1; i++) {
            SurveyHelper._doc.deletePage(1);
        }
        let rect = SurveyHelper.createRect(point, margins.width, y);
        return new HTMLBrick(question, controller, rect, html);
    }
    static createBoldTextFlat(point: IPoint, question: Question, controller: DocController, text: string) {
        controller.fontStyle = 'bold';
        let composite: IPdfBrick = SurveyHelper.createTextFlat(point, question, controller,
            text);
        controller.fontStyle = 'normal';
        return composite;
    }
    static createTitleFlat(point: IPoint, question: Question, controller: DocController): IPdfBrick {
        let composite: IPdfBrick = SurveyHelper.createBoldTextFlat(point, question, controller,
            SurveyHelper.getTitleText(question));
        return composite;
    }
    static createTitlePanelFlat(point: IPoint, question: IQuestion,
        controller: DocController, text: string): IPdfBrick {
        let oldFontSize: number = controller.fontSize;
        controller.fontSize = oldFontSize * SurveyHelper.TITLE_PANEL_FONT_SIZE_SCALE_MAGIC;
        controller.fontStyle = 'bold';
        let composite: IPdfBrick = SurveyHelper.createTextFlat(point, question, controller, text);
        controller.fontStyle = 'normal';
        controller.fontSize = oldFontSize;
        return composite;
    }
    static createDescFlat(point: IPoint, question: IQuestion, controller: DocController, text: string): IPdfBrick {
        let oldFontSize: number = controller.fontSize;
        controller.fontSize = oldFontSize * SurveyHelper.DESCRIPTION_FONT_SIZE_SCALE_MAGIC;
        let composite: IPdfBrick = SurveyHelper.createTextFlat(point, question, controller, text);
        controller.fontSize = oldFontSize;
        return composite;
    }
    static createOtherFlat(point: IPoint, question: IQuestion, controller: DocController): IPdfBrick {
        let otherRect: IRect = SurveyHelper.createTextFieldRect(point, controller, 2);
        return new CommentBrick(question, controller, otherRect, false);
    }
    static createTextFieldRect(point: IPoint, controller: DocController, lines: number = 1): IRect {
        let width: number = controller.paperWidth - point.xLeft -
            controller.margins.marginRight;
        let height: number = SurveyHelper.measureText().height * lines;
        return SurveyHelper.createRect(point, width, height);
    }
    static createAcroformRect(rect: IRect): Array<number> {
        return [
            rect.xLeft,
            rect.yTop,
            rect.xRight - rect.xLeft,
            rect.yBot - rect.yTop
        ];
    }
    static getTitleText(question: Question): string {
        let number: string = question.no != '' ? question.no + ' . ' : '';
        return number + SurveyHelper.getLocString(question.locTitle);
    }
    static getLocString(locObj: LocalizableString): string {
        return locObj.renderedHtml;
    }
    static getRatingMinWidth(): number {
        return SurveyHelper.measureText(SurveyHelper.RATING_MIN_WIDTH).width;
    }
    static getRatingItemText(question: QuestionRatingModel,
        index: number, text: string): string {
        if (index == 0 && question.minRateDescription) {
            text = SurveyHelper.getLocString(
                question.locMinRateDescription) + text;
        }
        else if (index == question.visibleRateValues.length - 1 &&
            question.maxRateDescription) {
            text += SurveyHelper.getLocString(question.locMaxRateDescription);
        }
        return text;
    }
    static getColumnWidth(question: Question, controller: DocController) {
        return (controller.paperWidth - controller.margins.marginLeft
            - controller.margins.marginRight) /
            (question.hasRows ? (question.visibleColumns.length + 1)
                : question.visibleColumns.length);
    }
    static setColumnMargins(question: Question, controller: DocController, column: number) {
        let cellWidth = this.getColumnWidth(question, controller);
        controller.margins.marginLeft = controller.margins.marginLeft + column * cellWidth;
        controller.margins.marginRight = controller.paperWidth - controller.margins.marginLeft - cellWidth;
    }
    static createRowlineFlat(point: IPoint, controller: DocController): IPdfBrick {
        return new RowlineBrick({
            xLeft: controller.margins.marginLeft,
            xRight: controller.paperWidth - controller.margins.marginRight,
            yTop: point.yTop + SurveyHelper.EPSILON,
            yBot: point.yTop + SurveyHelper.EPSILON
        });
    }
    static clone(src: any) {
        let target: any = {};
        for (let prop in src) {
            if (src.hasOwnProperty(prop)) {
                target[prop] = src[prop];
            }
        }
        return target;
    }
}