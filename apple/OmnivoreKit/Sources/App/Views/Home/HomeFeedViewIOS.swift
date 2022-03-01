import Combine
import Models
import Services
import SwiftUI
import UserNotifications
import Utils
import Views

#if os(iOS)
  struct HomeFeedContainerView: View {
    let isCompact: Bool
    @EnvironmentObject var dataService: DataService
    @State private var searchQuery = ""
    @State private var snoozePresented = false
    @State private var itemToSnooze: FeedItem?
    @State private var selectedLinkItem: FeedItem?
    @ObservedObject var viewModel: HomeFeedViewModel

    var body: some View {
      Group {
        if #available(iOS 15.0, *) {
          HomeFeedView(
            isCompact: isCompact,
            searchQuery: $searchQuery,
            selectedLinkItem: $selectedLinkItem,
            snoozePresented: $snoozePresented,
            itemToSnooze: $itemToSnooze,
            viewModel: viewModel
          )
          .refreshable {
            viewModel.loadItems(dataService: dataService, searchQuery: searchQuery, isRefresh: true)
          }
          .searchable(
            text: $searchQuery,
            placement: .sidebar
          ) {
            if searchQuery.isEmpty {
              Text("Inbox").searchCompletion("in:inbox ")
              Text("All").searchCompletion("in:all ")
              Text("Archived").searchCompletion("in:archive ")
              Text("Files").searchCompletion("type:file ")
            }
          }
          .onChange(of: searchQuery) { _ in
            // Maybe we should debounce this, but
            // it feels like it works ok without
            viewModel.loadItems(dataService: dataService, searchQuery: searchQuery, isRefresh: true)
          }
          .onSubmit(of: .search) {
            viewModel.loadItems(dataService: dataService, searchQuery: searchQuery, isRefresh: true)
          }
        } else {
          HomeFeedView(
            isCompact: isCompact,
            searchQuery: $searchQuery,
            selectedLinkItem: $selectedLinkItem,
            snoozePresented: $snoozePresented,
            itemToSnooze: $itemToSnooze,
            viewModel: viewModel
          )
          .toolbar {
            ToolbarItem {
              Button(
                action: { viewModel.loadItems(dataService: dataService, searchQuery: searchQuery, isRefresh: true) },
                label: { Label("Refresh Feed", systemImage: "arrow.clockwise") }
              )
            }
          }
        }
      }
      .navigationTitle("Home")
      .onReceive(NotificationCenter.default.publisher(for: UIApplication.willEnterForegroundNotification)) { _ in
        // Don't refresh the list if the user is currently reading an article
        if selectedLinkItem == nil {
          viewModel.loadItems(dataService: dataService, searchQuery: searchQuery, isRefresh: true)
        }
      }
      .onReceive(NotificationCenter.default.publisher(for: Notification.Name("PushFeedItem"))) { notification in
        if let feedItem = notification.userInfo?["feedItem"] as? FeedItem {
          viewModel.pushFeedItem(item: feedItem)
          self.selectedLinkItem = feedItem
        }
      }
      .formSheet(isPresented: $snoozePresented) {
        SnoozeView(snoozePresented: $snoozePresented, itemToSnooze: $itemToSnooze) {
          viewModel.snoozeUntil(
            dataService: dataService,
            linkId: $0.feedItemId,
            until: $0.snoozeUntilDate,
            successMessage: $0.successMessage
          )
        }
      }
      .onAppear {
        if viewModel.items.isEmpty {
          viewModel.loadItems(dataService: dataService, searchQuery: searchQuery, isRefresh: true)
        }
      }
    }
  }

  struct HomeFeedView: View {
    let isCompact: Bool
    @Binding var searchQuery: String
    @Binding var selectedLinkItem: FeedItem?
    @Binding var snoozePresented: Bool
    @Binding var itemToSnooze: FeedItem?

    @ObservedObject var viewModel: HomeFeedViewModel

    var body: some View {
      if isCompact {
        HomeFeedListView(
          searchQuery: $searchQuery,
          selectedLinkItem: $selectedLinkItem,
          snoozePresented: $snoozePresented,
          itemToSnooze: $itemToSnooze,
          viewModel: viewModel
        )
      } else {
        HomeFeedGridView(
          searchQuery: $searchQuery,
          selectedLinkItem: $selectedLinkItem,
          snoozePresented: $snoozePresented,
          itemToSnooze: $itemToSnooze,
          viewModel: viewModel
        )
      }
    }
  }

  struct HomeFeedListView: View {
    @EnvironmentObject var dataService: DataService
    @Binding var searchQuery: String
    @Binding var selectedLinkItem: FeedItem?
    @Binding var snoozePresented: Bool
    @Binding var itemToSnooze: FeedItem?

    @State private var itemToRemove: FeedItem?
    @State private var confirmationShown = false

    @ObservedObject var viewModel: HomeFeedViewModel

    var body: some View {
      List {
        Section {
          ForEach(viewModel.items) { item in
            let link = ZStack {
              FeedCardNavigationLink(
                item: item,
                searchQuery: searchQuery,
                selectedLinkItem: $selectedLinkItem,
                viewModel: viewModel
              )
            }.contextMenu {
              FeedItemContextMenuView(
                item: item,
                selectedLinkItem: $selectedLinkItem,
                snoozePresented: $snoozePresented,
                itemToSnooze: $itemToSnooze,
                viewModel: viewModel
              )
            }
            if #available(iOS 15.0, *) {
              link
                .swipeActions(edge: .trailing, allowsFullSwipe: true) {
                  if !item.isArchived {
                    Button {
                      withAnimation(.linear(duration: 0.4)) {
                        viewModel.setLinkArchived(dataService: dataService, linkId: item.id, archived: true)
                      }
                    } label: {
                      Label("Archive", systemImage: "archivebox")
                    }.tint(.green)
                  } else {
                    Button {
                      withAnimation(.linear(duration: 0.4)) {
                        viewModel.setLinkArchived(dataService: dataService, linkId: item.id, archived: false)
                      }
                    } label: {
                      Label("Unarchive", systemImage: "tray.and.arrow.down.fill")
                    }.tint(.indigo)
                  }
                }
                .swipeActions(edge: .trailing, allowsFullSwipe: true) {
                  Button(
                    role: .destructive,
                    action: {
                      itemToRemove = item
                      confirmationShown = true
                    },
                    label: {
                      Image(systemName: "trash")
                    }
                  )
                }.alert("Are you sure?", isPresented: $confirmationShown) {
                  Button("Remove Link", role: .destructive) {
                    if let itemToRemove = itemToRemove {
                      withAnimation {
                        viewModel.removeLink(dataService: dataService, linkId: itemToRemove.id)
                      }
                    }
                    self.itemToRemove = nil
                  }
                  Button("Cancel", role: .cancel) { self.itemToRemove = nil }
                }
                .swipeActions(edge: .leading, allowsFullSwipe: true) {
                  if FeatureFlag.enableSnooze {
                    Button {
                      itemToSnooze = item
                      snoozePresented = true
                    } label: {
                      Label { Text("Snooze") } icon: { Image.moon }
                    }.tint(.appYellow48)
                  }
                }
            } else {
              link
            }
          }
        }

        if viewModel.isLoading {
          LoadingSection()
        }
      }
      .listStyle(PlainListStyle())
    }
  }

  struct HomeFeedGridView: View {
    @EnvironmentObject var dataService: DataService
    @Binding var searchQuery: String
    @Binding var selectedLinkItem: FeedItem?
    @Binding var snoozePresented: Bool
    @Binding var itemToSnooze: FeedItem?

    @State private var itemToRemove: FeedItem?
    @State private var confirmationShown = false

    @ObservedObject var viewModel: HomeFeedViewModel

    var body: some View {
      ScrollView {
        LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 20) {
          ForEach(viewModel.items) { item in
            let link = ZStack {
              FeedCardNavigationLink(
                item: item,
                searchQuery: searchQuery,
                selectedLinkItem: $selectedLinkItem,
                viewModel: viewModel
              )
            }.contextMenu {
              FeedItemContextMenuView(
                item: item,
                selectedLinkItem: $selectedLinkItem,
                snoozePresented: $snoozePresented,
                itemToSnooze: $itemToSnooze,
                viewModel: viewModel
              )
            }
            if #available(iOS 15.0, *) {
              link
                .alert("Are you sure?", isPresented: $confirmationShown) {
                  Button("Remove Link", role: .destructive) {
                    if let itemToRemove = itemToRemove {
                      withAnimation {
                        viewModel.removeLink(dataService: dataService, linkId: itemToRemove.id)
                      }
                    }
                    self.itemToRemove = nil
                  }
                  Button("Cancel", role: .cancel) { self.itemToRemove = nil }
                }
            } else {
              link
            }
          }
        }

        if viewModel.isLoading {
          LoadingSection()
        }
      }
    }
  }

#endif
