"use strict";

import { ServiceBroker } from 'moleculer';
import GunDBService from '../../src/index';

describe("Test GunDBService", () => {
	const broker = new ServiceBroker();
	const service = broker.createService(GunDBService);

	beforeAll(() => broker.start());
	afterAll(() => broker.stop());

	it("should be created", () => {
		expect(service).toBeDefined();
	});

	it("should return with 'Hello Anonymous'", () => {
		return broker.call("gundb.test").then(res => {
			expect(res).toBe("Hello there Anonymous");
		});
	});

	it("should return with 'Hello John'", () => {
		return broker.call("gundb.test", { name: "John" }).then(res => {
			expect(res).toBe("Hello there John");
		});
	});
});
