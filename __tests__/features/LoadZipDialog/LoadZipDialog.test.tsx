import "@testing-library/jest-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";

import fs from "fs";

import { LoadZipDialog,LoadZipCore } from "../../../src/features/LoadZipDialog/LoadZipDialog";

describe("LoadZipDialog", () => {
  const buffer = fs.readFileSync("./__tests__/__fixtures__/minimumTestVB.zip");
  const uBuffer = fs.readFileSync("./__tests__/__fixtures__/minimumTestVB_utf8.zip");
  it("LoadZipCore:指定した文字コードでzipを読み込む:shift-jis", async() => {
    const inputFile = new File([buffer], "dummy.zip");
    const setZipFileNameSpy=vi.fn()
    const setProcessingSpy=vi.fn()
    const files=await LoadZipCore(inputFile,"Shift-Jis",setZipFileNameSpy,setProcessingSpy)
    expect(setZipFileNameSpy).toHaveBeenCalledWith("dummy.zip")
    expect(setProcessingSpy).toHaveBeenCalledWith(false)
    expect(Object.keys(files)).toContain("denoise/denoise/01_あかきくけこ.wav") //文字コードが正しいためひらがなが読み込めるはず。
  });
  it("LoadZipCore:指定した文字コードでzipを読み込む:utf-8", async() => {
    const inputFile = new File([uBuffer], "dummy.zip");
    const setZipFileNameSpy=vi.fn()
    const setProcessingSpy=vi.fn()
    const files=await LoadZipCore(inputFile,"utf-8",setZipFileNameSpy,setProcessingSpy)
    console.log(Object.keys(files))
    expect(setZipFileNameSpy).toHaveBeenCalledWith("dummy.zip")
    expect(setProcessingSpy).toHaveBeenCalledWith(false)
    expect(Object.keys(files)).toContain("denoise/denoise/01_あかきくけこ.wav") //文字コードが正しいためひらがなが読み込めるはず。
  });
});
