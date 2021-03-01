---
title: 'condaで仮想環境を再構築する'
date: '2021-02-27'
tags: 'python jupyter conda'
---

# はじめに

conda での仮想環境を構築する際に，その環境をまた再構築したくなった（違う PC での実行など）ので再構築の方法をまとめることにした．

# 開発環境

- MacOs：Mac mini (2018) macOS Big Sur ver.11.1
- conda：conda 4.9.2

# 仮想環境の作成と再構築

以下のコマンドを実行する．

```console
$ conda create -n [仮想環境名] python=[pythonのversion]
$ # conda create -n test_p36 python=3.6
```

## 仮想環境の再構築

### export

以下のコマンドを実行する．

```console
$ conda env export -n [環境変数名] > [保存するファイル名].yml
$ # conda env export --no-build -n test_p36 > test_p36.yml
```

### import

以下のコマンドを実行する．

```console
$ conda env create -f [仮想環境をexportしたymlファイル]
$ # conda env create -f test_p36.yml
```
