import { injectable } from 'inversify';
import { Range, window } from 'vscode';

import { logExceptions } from '../decorators/logExceptions';
import { Parser } from '../parser';
import { ICommandable } from './../interfaces/commandable';

@injectable()
export class UglifyCommand implements ICommandable {
    private _parser: Parser;

    public name: string = 'edi-x12-support.uglify';

    public constructor(parser: Parser) {
        this._parser = parser;
    }

    @logExceptions
    // tslint:disable-next-line:no-any
    public command(...args: Array<any>) {
        let document = window.activeTextEditor.document.getText();

        let result = this._parser.parseHeader(document);
        if (!result.isValid) {
            window.showErrorMessage('No ISA header found.');
            return;
        }
        let segments = this._parser.parseSegments(document, result.configuration);
        let text = segments.join('');

        window.activeTextEditor.edit(builder => {
            let start = window.activeTextEditor.document.positionAt(segments[0].startIndex);
            let end = window.activeTextEditor.document.positionAt(segments[segments.length - 1].endIndex);
            builder.replace(new Range(start, end), text);
        });
    }

    public dispose() {
    }
}