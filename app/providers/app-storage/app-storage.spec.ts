import {beforeEachProviders, beforeEach, it, describe, expect, inject, setBaseTestProviders} from '@angular/core/testing';
// import {TEST_BROWSER_PLATFORM_PROVIDERS, TEST_BROWSER_APPLICATION_PROVIDERS} from '@angular/platform-browser/testing';
import {AppStorage} from './app-storage';
import {Parse} from '../parse/parse';
import {UserReport} from '../user-report/user-report';
import {TranslateService} from 'ng2-translate/ng2-translate';
import {App} from 'ionic-angular';
import {provide} from '@angular/core';

import * as PouchDB from 'pouchdb';

// setBaseTestProviders(TEST_BROWSER_PLATFORM_PROVIDERS, TEST_BROWSER_APPLICATION_PROVIDERS);

class MockTranslateService {
    constructor() {

    }

    get(arr) {
        let translations = {};
        if (typeof arr == "Array") {
            for (var i = 0; i < arr.length; i++) {
                translations[arr[i]] = "Hello";
            }
        }else {
            translations = "Hello";
        }
        return translations;
    }
}

class MockUserReport {
    constructor() {

    }

    report(err) {

    }
}

describe("AppStorage Service", () => {
    beforeEachProviders(() => [AppStorage, Parse, provide(UserReport, {useClass: MockUserReport}), provide(TranslateService, {useClass: MockTranslateService})]);

    beforeEach(inject([AppStorage], (storage) => {
        storage.init();
    }));

    it("should remove every project", inject([AppStorage], (storage: AppStorage) => {
        return storage.getProjects().then(projects => {
            for (var i = 0; i < projects.length; i++) {
                storage.deleteProject(projects[i]._id);
                expect(true).toBeTruthy();
            }
        });
    }));

    it("should init", inject([AppStorage], (storage: AppStorage) => {
        expect(storage.projectDB).not.toBeNull();
        expect(storage.sourceDB).not.toBeNull();
        expect(storage.pendingDB).not.toBeNull();
    }));

    it("should return an array of zero objects", inject([AppStorage], (storage: AppStorage) => {
        return storage.getProjects().then(res => {
            expect(Array.isArray(res)).toBeTruthy();
            expect(res.length).toBe(0);
        });
    }));

    it("should create a project", inject([AppStorage], (storage: AppStorage) => {
        return storage.createProject({ name: "Hello", matter: "World" }).then(res => {
            return storage.getProjects().then(projects => {
                expect(projects.length).toBe(1);
            });
        });
    }));

    it("should get a project", inject([AppStorage], (storage: AppStorage) => {
        return storage.getProjects().then(projects => {
            return storage.getProjectFromId(projects[0]._id).then(project => {
                expect(project).not.toBeNull();
                expect(project).not.toBeUndefined();
                expect(project).toBe(projects[0]);
            });
        });
    }));

    it("should edit a project", inject([AppStorage], (storage: AppStorage) => {
        return storage.getProjects().then(projects => {
            projects[0].name = "hello";
            return storage.setProjectFromId(projects[0]._id, projects[0]).then(res => {
                return storage.getProjects().then(projects => {
                    expect(projects[0].name).toBe("hello");
                });
            });
        });
    }));

    it("should delete a project", inject([AppStorage], (storage: AppStorage) => {
        return storage.getProjects().then(projects => {
            return storage.deleteProject(projects[0]._id).then(res => {
                return storage.getProjects().then(projects => {
                    expect(projects.length).toBe(0);
                });
            });
        });
    }));
});
