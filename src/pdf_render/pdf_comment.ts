import { IQuestion, QuestionTextModel } from 'survey-core';
import { IRect, DocController } from '../doc_controller';
import { TextFieldBrick } from './pdf_textfield';

export class CommentBrick extends TextFieldBrick {
    protected question: QuestionTextModel;
    constructor(question: IQuestion, protected controller: DocController, rect: IRect) {
        super(question, controller, rect);
        this.question = <QuestionTextModel>question;
        this.isMultiline = true;
    }
}